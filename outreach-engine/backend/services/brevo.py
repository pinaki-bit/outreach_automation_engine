"""
Brevo transactional email service.

REAL IMPLEMENTATION. Requires BREVO_API_KEY env var.
Falls back to a clear error if the key is missing.
"""
import httpx
from config import BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, HTTP_MAX_CONNECTIONS, HTTP_MAX_KEEPALIVE

BREVO_URL = "https://api.brevo.com/v3/smtp/email"

_brevo_client: httpx.AsyncClient | None = None


def is_live() -> bool:
    return bool(BREVO_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _brevo_client
    if _brevo_client is None:
        limits = httpx.Limits(max_connections=HTTP_MAX_CONNECTIONS, max_keepalive_connections=HTTP_MAX_KEEPALIVE)
        _brevo_client = httpx.AsyncClient(limits=limits, timeout=15.0)
    return _brevo_client


def send(recipient: str, subject: str, body: str) -> dict:
    if not BREVO_API_KEY:
        return {
            "ok": False,
            "error": "BREVO_API_KEY is not set. Add it to backend/.env before sending.",
        }

    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to": [{"email": recipient}],
        "subject": subject,
        "textContent": body,
    }
    headers = {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        r = httpx.post(BREVO_URL, json=payload, headers=headers, timeout=15.0)
    except httpx.HTTPError as e:
        return {"ok": False, "error": f"Brevo request failed: {e}"}

    if r.status_code >= 400:
        return {"ok": False, "error": f"Brevo {r.status_code}: {r.text}"}

    data = r.json()
    return {"ok": True, "message_id": data.get("messageId")}


async def send_async(recipient: str, subject: str, body: str) -> dict:
    """Async version for bulk sending."""
    if not BREVO_API_KEY:
        return {
            "ok": False,
            "error": "BREVO_API_KEY is not set.",
        }

    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to": [{"email": recipient}],
        "subject": subject,
        "textContent": body,
    }
    headers = {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    client = _get_client()
    try:
        r = await client.post(BREVO_URL, json=payload, headers=headers)
    except httpx.HTTPError as e:
        return {"ok": False, "error": f"Brevo request failed: {e}"}

    if r.status_code >= 400:
        return {"ok": False, "error": f"Brevo {r.status_code}: {r.text}"}

    data = r.json()
    return {"ok": True, "message_id": data.get("messageId")}
