"""
Ocean.io lookalike-company service.

LIVE when OCEAN_API_KEY is set: POSTs to the Ocean.io lookalike endpoint
with the input domain and returns parsed company records.

MOCK when no key is set: returns deterministic fake companies so the
pipeline is exercisable end-to-end without paid API access.
"""
import hashlib
import logging
import functools

import httpx

from config import (
    HTTP_TIMEOUT,
    MAX_SIMILAR,
    OCEAN_API_KEY,
    OCEAN_API_URL,
    HTTP_MAX_CONNECTIONS,
    HTTP_MAX_KEEPALIVE,
)

log = logging.getLogger(__name__)

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

# Shared async client for connection pooling
_ocean_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(OCEAN_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _ocean_client
    if _ocean_client is None:
        limits = httpx.Limits(max_connections=HTTP_MAX_CONNECTIONS, max_keepalive_connections=HTTP_MAX_KEEPALIVE)
        _ocean_client = httpx.AsyncClient(limits=limits, timeout=HTTP_TIMEOUT)
    return _ocean_client


def _seed_from(domain: str) -> int:
    return int(hashlib.md5(domain.encode()).hexdigest(), 16) % (10**8)


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


async def _live_companies_async(company_name: str, domain: str, limit: int) -> list[dict]:
    url = f"{OCEAN_API_URL.rstrip('/')}/lookalike"
    headers = {"Authorization": f"Bearer {OCEAN_API_KEY}", "Accept": "application/json"}
    payload = {"domain": domain, "name": company_name, "limit": limit}

    client = _get_client()
    r = await client.post(url, json=payload, headers=headers)
    r.raise_for_status()
    data = r.json()

    out: list[dict] = []
    for item in data.get("companies", data.get("results", [])):
        out.append({
            "name": item.get("name") or item.get("company_name") or "Unknown",
            "domain": (item.get("domain") or item.get("website") or "").lower(),
            "industry": item.get("industry") or "SaaS",
            "size_range": item.get("size_range") or item.get("employees") or "50-200",
        })
    return out[:limit]


def find_similar(company_name: str, domain: str) -> list[dict]:
    """Sync wrapper for backward compatibility."""
    if not is_live():
        return _mock_companies(company_name, domain, MAX_SIMILAR)
    try:
        import asyncio
        return asyncio.run(_live_companies_async(company_name, domain, MAX_SIMILAR))
    except httpx.HTTPError as e:
        log.warning("Ocean.io live call failed (%s); falling back to mock data", e)
        return _mock_companies(company_name, domain, MAX_SIMILAR)


async def find_similar_async(company_name: str, domain: str) -> list[dict]:
    """Async version for use in pipeline."""
    if not is_live():
        return _mock_companies(company_name, domain, MAX_SIMILAR)
    try:
        return await _live_companies_async(company_name, domain, MAX_SIMILAR)
    except httpx.HTTPError as e:
        log.warning("Ocean.io live call failed (%s); falling back to mock data", e)
        return _mock_companies(company_name, domain, MAX_SIMILAR)
