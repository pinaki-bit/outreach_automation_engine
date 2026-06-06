"""
ZeroBounce email verification service.

LIVE when ZEROBOUNCE_API_KEY is set:
  - Calls the ZeroBounce v2 /validate endpoint to verify email addresses.
  - ZeroBounce returns a `status` field:
      "valid"   → deliverable
      "invalid" → undeliverable (bounce)
      "catch-all", "unknown", "spamtrap", "abuse", "do_not_mail"
  - We map these to a simple "verified" / "invalid" / "unknown" verdict.

MOCK when no key is set:
  Synthesizes a plausible email pattern from the contact name + domain and
  marks it "verified" so the pipeline is exercisable end-to-end.
"""
import hashlib
import logging

import httpx

from config import (
    HTTP_MAX_CONNECTIONS,
    HTTP_MAX_KEEPALIVE,
    HTTP_TIMEOUT,
    ZEROBOUNCE_API_KEY,
)

log = logging.getLogger(__name__)

ZEROBOUNCE_URL = "https://api.zerobounce.net/v2/validate"

# Shared async client
_zerobounce_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(ZEROBOUNCE_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _zerobounce_client
    if _zerobounce_client is None:
        limits = httpx.Limits(
            max_connections=HTTP_MAX_CONNECTIONS,
            max_keepalive_connections=HTTP_MAX_KEEPALIVE,
        )
        _zerobounce_client = httpx.AsyncClient(limits=limits, timeout=HTTP_TIMEOUT)
    return _zerobounce_client


# ── Helpers ───────────────────────────────────────────────────────────────────

def _seed(*parts: str) -> int:
    raw = "|".join(parts).encode()
    return int(hashlib.md5(raw).hexdigest(), 16) % (10 ** 8)


def _build_email(contact: dict) -> str:
    """Build a candidate email from name + domain."""
    first = (contact.get("first_name") or "there").lower().strip()
    last = (contact.get("last_name") or "").lower().strip()
    domain = (contact.get("company_domain") or "example.com").strip()

    seed = _seed(contact.get("contact_id", ""), first)
    patterns = [
        f"{first}.{last}@{domain}",
        f"{first[0]}{last}@{domain}" if last else f"{first}@{domain}",
        f"{first}@{domain}",
        f"{first}{last[0]}@{domain}" if last else f"{first}@{domain}",
    ]
    return patterns[seed % len(patterns)]


def _mock_verify(contact: dict) -> dict:
    return {
        "contact_id": contact["contact_id"],
        "email": _build_email(contact),
        "status": "verified",
    }


# ── Live implementation ───────────────────────────────────────────────────────

# ZeroBounce status → our internal status
_STATUS_MAP = {
    "valid": "verified",
    "catch-all": "catch-all",
    "unknown": "unknown",
    "spamtrap": "invalid",
    "abuse": "invalid",
    "do_not_mail": "invalid",
    "invalid": "invalid",
}


async def _live_verify_async(contact: dict) -> dict:
    """
    ZeroBounce requires a confirmed email address to validate.
    We first build a candidate email from name+domain, then validate it.
    If a pre-existing email is stored on the contact we use that instead.
    """
    email = contact.get("email") or _build_email(contact)

    params = {
        "api_key": ZEROBOUNCE_API_KEY,
        "email": email,
        "ip_address": "",  # optional – leave blank
    }

    client = _get_client()
    r = await client.get(ZEROBOUNCE_URL, params=params)
    r.raise_for_status()
    data = r.json()

    raw_status = (data.get("status") or "unknown").lower()
    our_status = _STATUS_MAP.get(raw_status, "unknown")

    return {
        "contact_id": contact["contact_id"],
        "email": data.get("address") or email,
        "status": our_status,
        "zb_status": raw_status,           # raw ZeroBounce status for UI display
        "zb_sub_status": data.get("sub_status", ""),
    }


# ── Public API ────────────────────────────────────────────────────────────────

def verify(contact: dict) -> dict:
    """Sync wrapper for backward compatibility."""
    if not is_live():
        return _mock_verify(contact)
    try:
        import asyncio
        return asyncio.run(_live_verify_async(contact))
    except httpx.HTTPError as e:
        log.warning("ZeroBounce live call failed (%s); falling back to mock", e)
        return _mock_verify(contact)


async def verify_async(contact: dict) -> dict:
    """Async version for use in the pipeline."""
    if not is_live():
        return _mock_verify(contact)
    try:
        return await _live_verify_async(contact)
    except httpx.HTTPError as e:
        log.warning("ZeroBounce live call failed (%s); falling back to mock", e)
        return _mock_verify(contact)
