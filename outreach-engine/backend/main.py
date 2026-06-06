"""
Outreach Automation Engine - FastAPI backend.

Service routing:
  Company search  → Apollo.io  (APOLLO_API_KEY)   | ocean.io fallback (OCEAN_API_KEY)
  Contact finder  → Prospeo    (PROSPEO_API_KEY)
  Email verify    → ZeroBounce (ZEROBOUNCE_API_KEY)| eazyreach fallback (EAZYREACH_API_KEY)
  Email send      → Brevo      (BREVO_API_KEY)
  AI generation   → Gemini     (GEMINI_API_KEY)
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import CORS_ORIGINS, MAX_CONCURRENT_REQUESTS
from email_generator import generate
from services import brevo, eazyreach, gemini, ocean, prospeo, apollo, zerobounce

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Close all async HTTP clients on shutdown
    for mod, attr in [
        (apollo,      "_apollo_client"),
        (ocean,       "_ocean_client"),
        (prospeo,     "_prospeo_client"),
        (zerobounce,  "_zerobounce_client"),
        (eazyreach,   "_eazyreach_client"),
        (brevo,       "_brevo_client"),
    ]:
        client = getattr(mod, attr, None)
        if client and not client.is_closed:
            await client.aclose()


app = FastAPI(title="Outreach Automation Engine", version="0.6.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response models ────────────────────────────────────────────────

class PipelineRequest(BaseModel):
    domain: str = Field(..., min_length=1)
    company_name: str | None = None


class SendRequest(BaseModel):
    recipient: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)


class BulkSendRequest(BaseModel):
    recipients: list[str] = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)


class RegenerateRequest(BaseModel):
    contact: dict
    sender_company: str | None = None
    style_hint: str | None = None


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "ok": True,
        "mode": {
            "company_search": "apollo (live)" if apollo.is_live() else ("ocean (live)" if ocean.is_live() else "mock"),
            "contact_finder": "prospeo (live)" if prospeo.is_live() else "mock",
            "email_verify":   "zerobounce (live)" if zerobounce.is_live() else ("eazyreach (live)" if eazyreach.is_live() else "mock"),
            "email_send":     "brevo (live)" if brevo.is_live() else "mock",
            "ai_generate":    "gemini (live)" if gemini.is_live() else "mock",
        },
    }


# ─── Utilities ────────────────────────────────────────────────────────────────

def _normalize_domain(value: str) -> str:
    domain = value.strip().lower()
    domain = domain.removeprefix("https://").removeprefix("http://")
    domain = domain.split("?")[0].split("#")[0]
    domain = domain.split("/")[0].strip()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


KNOWN_BRANDS = {
    "openai": "OpenAI",
    "github": "GitHub",
    "gitlab": "GitLab",
    "figma": "Figma",
    "notion": "Notion",
    "stripe": "Stripe",
    "anthropic": "Anthropic",
    "deepmind": "DeepMind",
}


def _company_name_from_domain(domain: str) -> str:
    base = domain.split(".")[0].replace("-", " ").replace("_", " ").strip()
    if not base:
        return domain
    if base in KNOWN_BRANDS:
        return KNOWN_BRANDS[base]
    return base.title()


# ─── Pipeline ─────────────────────────────────────────────────────────────────

async def _run_pipeline(req: PipelineRequest):
    domain = _normalize_domain(req.domain)
    if not domain:
        raise HTTPException(status_code=400, detail="domain is required")

    company_name = (req.company_name or "").strip() or _company_name_from_domain(domain)

    # Step 1 – Company search: prefer Apollo, fall back to Ocean
    if apollo.is_live():
        companies = await apollo.find_similar_async(company_name, domain)
    else:
        companies = await ocean.find_similar_async(company_name, domain)

    contacts: list[dict] = []
    emails: list[dict] = []
    email_content: dict[str, dict] = {}

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    async def process_company(company: dict):
        async with semaphore:
            # Step 2 – Contact finder: Prospeo
            c_contacts = await prospeo.find_contacts_async(company["name"], company["domain"])

            # Step 3 – Per-contact: email verify + AI email generation
            async def process_contact(c):
                # Email verification: prefer ZeroBounce, fall back to EazyReach
                if zerobounce.is_live():
                    verified = await zerobounce.verify_async(c)
                else:
                    verified = await eazyreach.verify_async(c)

                contact_record = {**c, "industry": company.get("industry")}
                content = await asyncio.to_thread(
                    generate, contact_record, sender_company=company_name
                )
                return contact_record, verified, content

            tasks = [process_contact(c) for c in c_contacts]
            results = await asyncio.gather(*tasks)
            for contact_record, verified, content in results:
                contacts.append(contact_record)
                emails.append(verified)
                email_content[contact_record["contact_id"]] = content

    await asyncio.gather(*(process_company(comp) for comp in companies))
    return {
        "companies": companies,
        "contacts": contacts,
        "emails": emails,
        "email_content": email_content,
    }


@app.post("/api/pipeline/run")
@app.post("/pipeline/run")
async def pipeline_run(req: PipelineRequest):
    return await _run_pipeline(req)


# ─── Email send ───────────────────────────────────────────────────────────────

def _send_email(req: SendRequest):
    result = brevo.send(req.recipient, req.subject, req.body)
    if not result.get("ok"):
        raise HTTPException(status_code=502, detail=result.get("error", "send failed"))
    return result


@app.post("/api/email/send")
@app.post("/email/send")
def email_send(req: SendRequest):
    return _send_email(req)


# ─── Bulk send ────────────────────────────────────────────────────────────────

@app.post("/api/email/send_bulk")
async def email_send_bulk(req: BulkSendRequest):
    """Send the same email to multiple recipients concurrently."""
    async def _send_one(recipient: str):
        try:
            result = await brevo.send_async(recipient, req.subject, req.body)
            return {"recipient": recipient, "ok": result.get("ok", False)}
        except Exception as e:
            return {"recipient": recipient, "ok": False, "error": str(e)}

    results = await asyncio.gather(*[_send_one(r) for r in req.recipients])
    return {"results": list(results)}


# ─── Regenerate email (AI) ────────────────────────────────────────────────────

@app.post("/api/email/regenerate")
async def email_regenerate(req: RegenerateRequest):
    """Re-generate an email for a contact with an optional style hint."""
    contact = req.contact
    sender = req.sender_company

    if req.style_hint:
        try:
            result = await asyncio.to_thread(
                gemini.generate_email_with_style,
                contact,
                sender,
                req.style_hint,
            )
            return result
        except Exception as e:
            log.warning("Gemini styled generation failed (%s); using default", e)

    try:
        result = await asyncio.to_thread(generate, contact, sender)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")


# ─── Cache management ─────────────────────────────────────────────────────────

@app.post("/api/cache/clear")
def cache_clear():
    """Clear all LRU caches (dev utility)."""
    cleared = []
    for mod, fn_name in [
        (ocean,   "_live_companies"),
        (prospeo, "_live_contacts"),
    ]:
        fn = getattr(mod, fn_name, None)
        if fn and hasattr(fn, "cache_clear"):
            fn.cache_clear()
            cleared.append(f"{mod.__name__}.{fn_name}")
    return {"cleared": cleared}
