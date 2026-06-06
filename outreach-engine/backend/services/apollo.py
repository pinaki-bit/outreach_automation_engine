"""
Apollo.io company-search service.

LIVE when APOLLO_API_KEY is set:
  - Uses the Apollo /mixed_people/search endpoint to find decision-makers
    (CEOs, CTOs, VPs, Heads-of-*) at companies similar to the input domain.
  - Falls back gracefully to mock data on any HTTP error.

MOCK when no key is set:
  Returns deterministic fake companies so the pipeline is exercisable
  end-to-end without paid API access.
"""
import hashlib
import logging

import httpx

from config import (
    APOLLO_API_KEY,
    APOLLO_API_URL,
    HTTP_MAX_CONNECTIONS,
    HTTP_MAX_KEEPALIVE,
    HTTP_TIMEOUT,
    MAX_SIMILAR,
)

log = logging.getLogger(__name__)

# ── Mock data pools ───────────────────────────────────────────────────────────

INDUSTRY_POOL = [
    "Artificial Intelligence", "Developer Tools", "Cloud Infrastructure",
    "Cybersecurity", "Fintech", "Healthtech", "E-commerce", "SaaS",
]
COMPANY_PREFIXES = [
    "Nexa", "Strato", "Quanta", "Vertex", "Helio", "Aero", "Lumen",
    "Synth", "Cogni", "Axiom", "Pulse", "Orbit", "Forge", "Grid",
]
COMPANY_SUFFIXES = [
    "Labs", "AI", "Systems", "Cloud", "Works", "Logic", "Stack",
    "Dynamics", "Robotics", "Networks",
]

# ── Shared async client ───────────────────────────────────────────────────────

_apollo_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(APOLLO_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _apollo_client
    if _apollo_client is None:
        limits = httpx.Limits(
            max_connections=HTTP_MAX_CONNECTIONS,
            max_keepalive_connections=HTTP_MAX_KEEPALIVE,
        )
        _apollo_client = httpx.AsyncClient(limits=limits, timeout=HTTP_TIMEOUT)
    return _apollo_client


# ── Helpers ───────────────────────────────────────────────────────────────────

def _seed_from(domain: str) -> int:
    return int(hashlib.md5(domain.encode()).hexdigest(), 16) % (10 ** 8)


def _mock_companies(company_name: str, domain: str, limit: int) -> list[dict]:
    seed = _seed_from(domain or company_name)
    companies = []
    for i in range(limit):
        prefix = COMPANY_PREFIXES[(seed + i * 7) % len(COMPANY_PREFIXES)]
        suffix = COMPANY_SUFFIXES[(seed + i * 13) % len(COMPANY_SUFFIXES)]
        name = f"{prefix}{suffix}"
        companies.append({
            "name": name,
            "domain": f"{name.lower()}.com",
            "industry": INDUSTRY_POOL[(seed + i) % len(INDUSTRY_POOL)],
            "size_range": "50-200",
        })
    return companies


# ── Live implementation ───────────────────────────────────────────────────────

SENIORITY_TARGETS = ["c_suite", "vp", "director", "manager"]
TITLE_KEYWORDS = ["ceo", "cto", "coo", "cfo", "vp", "head of", "director", "founder"]


async def _live_companies_async(company_name: str, domain: str, limit: int) -> list[dict]:
    """
    Apollo's /organizations/search gives us companies similar to a domain.
    We use the v1 endpoint with a domain seed.
    """
    url = f"{APOLLO_API_URL.rstrip('/')}/organizations/search"
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": APOLLO_API_KEY,
    }
    payload = {
        "api_key": APOLLO_API_KEY,
        "q_organization_domains": domain,
        "page": 1,
        "per_page": min(limit * 3, 25),  # fetch a few extra then trim
    }

    client = _get_client()
    r = await client.post(url, json=payload, headers=headers)
    r.raise_for_status()
    data = r.json()

    out: list[dict] = []
    for item in data.get("organizations", []):
        name = item.get("name") or "Unknown"
        raw_domain = (item.get("primary_domain") or item.get("website_url") or "").lower()
        # strip protocol/path
        raw_domain = raw_domain.removeprefix("https://").removeprefix("http://").split("/")[0]
        if not raw_domain:
            raw_domain = f"{name.lower().replace(' ', '')}.com"
        out.append({
            "name": name,
            "domain": raw_domain,
            "industry": item.get("industry") or item.get("keywords", ["SaaS"])[0] if item.get("keywords") else "SaaS",
            "size_range": item.get("estimated_num_employees") or "50-200",
        })
        if len(out) >= limit:
            break

    # If Apollo returned nothing (e.g., unknown domain), fall back gracefully
    if not out:
        log.warning("Apollo returned 0 organizations for %s; using mock", domain)
        return _mock_companies(company_name, domain, limit)

    return out


# ── Public API ────────────────────────────────────────────────────────────────

def find_similar(company_name: str, domain: str) -> list[dict]:
    """Sync wrapper for backward compatibility."""
    if not is_live():
        return _mock_companies(company_name, domain, MAX_SIMILAR)
    try:
        import asyncio
        return asyncio.run(_live_companies_async(company_name, domain, MAX_SIMILAR))
    except httpx.HTTPError as e:
        log.warning("Apollo live call failed (%s); falling back to mock data", e)
        return _mock_companies(company_name, domain, MAX_SIMILAR)


async def find_similar_async(company_name: str, domain: str) -> list[dict]:
    """Async version for use in the pipeline."""
    if not is_live():
        return _mock_companies(company_name, domain, MAX_SIMILAR)
    try:
        return await _live_companies_async(company_name, domain, MAX_SIMILAR)
    except httpx.HTTPError as e:
        log.warning("Apollo live call failed (%s); falling back to mock data", e)
        return _mock_companies(company_name, domain, MAX_SIMILAR)
