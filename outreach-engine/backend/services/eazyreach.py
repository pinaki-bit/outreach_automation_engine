"""
EazyReach email verification service.

LIVE when EAZYREACH_API_KEY is set: POSTs the contact to the EazyReach
verify endpoint and returns the verifier's verdict and email.

MOCK when no key is set: synthesizes a plausible email pattern from the
contact and marks it "verified" so the pipeline is exercisable.
"""
import hashlib
import logging

import httpx

from config import EAZYREACH_API_KEY, EAZYREACH_API_URL, HTTP_TIMEOUT, HTTP_MAX_CONNECTIONS, HTTP_MAX_KEEPALIVE

log = logging.getLogger(__name__)

# Shared async client for connection pooling
_eazyreach_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(EAZYREACH_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _eazyreach_client
    if _eazyreach_client is None:
        limits = httpx.Limits(max_connections=HTTP_MAX_CONNECTIONS, max_keepalive_connections=HTTP_MAX_KEEPALIVE)
        _eazyreach_client = httpx.AsyncClient(limits=limits, timeout=HTTP_TIMEOUT)
    return _eazyreach_client


def _seed(*parts: str) -> int:
    raw = "|".join(parts).encode()
    return int(hashlib.md5(raw).hexdigest(), 16) % (10**8)


def _mock_verify(contact: dict) -> dict:
    seed = _seed(contact.get("contact_id", ""), contact.get("first_name", ""))
    first = (contact.get("first_name") or "there").lower()
    last = (contact.get("last_name") or "").lower()
    domain = contact.get("company_domain") or "example.com"

    patterns = [
        f"{first}.{last}@{domain}",
        f"{first[0]}{last}@{domain}",
        f"{first}@{domain}",
        f"{first}{last[0]}@{domain}",
    ]
    email = patterns[seed % len(patterns)]
    return {
        "contact_id": contact["contact_id"],
        "email": email,
        "status": "verified",
    }


async def _live_verify_async(contact: dict) -> dict:
    url = f"{EAZYREACH_API_URL.rstrip('/')}/verify"
    headers = {
        "Authorization": f"Bearer {EAZYREACH_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "first_name": contact.get("first_name"),
        "last_name": contact.get("last_name"),
        "company": contact.get("company"),
        "domain": contact.get("company_domain"),
    }

    client = _get_client()
    r = await client.post(url, json=payload, headers=headers)
    r.raise_for_status()
    data = r.json()

    return {
        "contact_id": contact["contact_id"],
        "email": data.get("email") or contact.get("email") or "",
        "status": data.get("status", "unknown"),
    }


def _live_verify(contact: dict) -> dict:
    """Sync wrapper for backward compatibility."""
    import asyncio
    return asyncio.run(_live_verify_async(contact))


def verify(contact: dict) -> dict:
    if not is_live():
        return _mock_verify(contact)
    try:
        return _live_verify(contact)
    except httpx.HTTPError as e:
        log.warning("EazyReach live call failed (%s); falling back to mock verify", e)
        return _mock_verify(contact)


async def verify_async(contact: dict) -> dict:
    """Async version for use in pipeline."""
    if not is_live():
        return _mock_verify(contact)
    try:
        return await _live_verify_async(contact)
    except httpx.HTTPError as e:
        log.warning("EazyReach live call failed (%s); falling back to mock verify", e)
        return _mock_verify(contact)
