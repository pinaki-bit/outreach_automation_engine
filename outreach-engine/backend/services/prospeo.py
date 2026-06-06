"""
Prospeo decision-maker service.

LIVE when PROSPEO_API_KEY is set:
  - POSTs to the Prospeo search-person endpoint with the company domain.
  - Returns parsed contact records.
  - Falls back gracefully to mock data if there are no results or on any HTTP error.

MOCK when no key is set:
  Returns deterministic fake contacts so the pipeline is exercisable.
"""
import hashlib
import logging
import httpx
import functools

from config import (
    HTTP_TIMEOUT,
    MAX_CONTACTS_PER_COMPANY,
    PROSPEO_API_KEY,
    PROSPEO_API_URL,
    HTTP_MAX_CONNECTIONS,
    HTTP_MAX_KEEPALIVE,
)

log = logging.getLogger(__name__)

FIRST_NAMES = [
    "Avery", "Jordan", "Riley", "Morgan", "Casey", "Quinn",
    "Reese", "Sage", "Drew", "Parker",
]
LAST_NAMES = [
    "Chen", "Patel", "Garcia", "Kowalski", "Nakamura", "Okafor",
    "Silva", "Hassan", "Ivanov", "Mueller",
]
TITLES = [
    "CEO", "CTO", "Head of Growth", "VP Engineering", "Head of Marketing",
]

# Shared async client for connection pooling
_prospeo_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(PROSPEO_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _prospeo_client
    if _prospeo_client is None:
        limits = httpx.Limits(max_connections=HTTP_MAX_CONNECTIONS, max_keepalive_connections=HTTP_MAX_KEEPALIVE)
        _prospeo_client = httpx.AsyncClient(limits=limits, timeout=HTTP_TIMEOUT)
    return _prospeo_client


def _seed(*parts: str) -> int:
    raw = "|".join(parts).encode()
    return int(hashlib.md5(raw).hexdigest(), 16) % (10**8)


def _mock_contacts(company_name: str, company_domain: str, limit: int) -> list[dict]:
    seed = _seed(company_domain, company_name)
    contacts = []
    for i in range(limit):
        first = FIRST_NAMES[(seed + i * 3) % len(FIRST_NAMES)]
        last = LAST_NAMES[(seed + i * 5) % len(LAST_NAMES)]
        contacts.append({
            "contact_id": f"{company_domain}-{i}",
            "first_name": first,
            "last_name": last,
            "full_name": f"{first} {last}",
            "title": TITLES[(seed + i) % len(TITLES)],
            "company": company_name,
            "company_domain": company_domain,
            "linkedin_url": f"https://www.linkedin.com/in/{first.lower()}-{last.lower()}",
        })
    return contacts


async def _live_contacts_async(company_name: str, company_domain: str, limit: int) -> list[dict]:
    # Prospeo Search Person API endpoint
    url = f"{PROSPEO_API_URL.rstrip('/')}/search-person"
    headers = {
        "X-KEY": PROSPEO_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "filters": {
            "company": {
                "websites": {
                    "include": [company_domain]
                }
            }
        }
    }

    client = _get_client()
    r = await client.post(url, json=payload, headers=headers)
    
    # Prospeo returns HTTP 400 with NO_RESULTS if nothing matches.
    # Handle that gracefully here.
    if r.status_code == 400:
        try:
            error_data = r.json()
            if error_data.get("error_code") == "NO_RESULTS":
                log.info("Prospeo search returned no results for domain %s; using mock", company_domain)
                return _mock_contacts(company_name, company_domain, limit)
        except Exception:
            pass

    r.raise_for_status()
    data = r.json()

    out: list[dict] = []
    for i, item in enumerate(data.get("results", [])):
        person = item.get("person", {})
        if not person:
            continue
        first = person.get("first_name") or "there"
        last = person.get("last_name") or ""
        out.append({
            "contact_id": person.get("person_id") or f"{company_domain}-{i}",
            "first_name": first,
            "last_name": last,
            "full_name": person.get("full_name") or f"{first} {last}".strip(),
            "title": person.get("current_job_title") or "",
            "company": company_name,
            "company_domain": company_domain,
            "linkedin_url": person.get("linkedin_url") or "",
        })
    
    if not out:
        return _mock_contacts(company_name, company_domain, limit)
        
    return out[:limit]


@functools.lru_cache(maxsize=128)
def _live_contacts(company_name: str, company_domain: str, limit: int) -> list[dict]:
    """Sync wrapper for backward compatibility."""
    import asyncio
    return asyncio.run(_live_contacts_async(company_name, company_domain, limit))


def find_contacts(company_name: str, company_domain: str) -> list[dict]:
    if not is_live():
        return _mock_contacts(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)
    try:
        return _live_contacts(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)
    except httpx.HTTPError as e:
        log.warning("Prospeo live call failed (%s); falling back to mock data", e)
        return _mock_contacts(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)


async def find_contacts_async(company_name: str, company_domain: str) -> list[dict]:
    """Async version for use in pipeline."""
    if not is_live():
        return _mock_contacts(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)
    try:
        return await _live_contacts_async(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)
    except httpx.HTTPError as e:
        log.warning("Prospeo live call failed (%s); falling back to mock data", e)
        return _mock_contacts(company_name, company_domain, MAX_CONTACTS_PER_COMPANY)
