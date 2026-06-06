import os
from dotenv import load_dotenv

load_dotenv()

# ── Ocean.io (legacy, not used if Apollo key is set) ─────────────────────────
OCEAN_API_KEY = os.getenv("OCEAN_API_KEY", "")
OCEAN_API_URL = os.getenv("OCEAN_API_URL", "https://api.ocean.io/v1")

# ── Apollo.io (replaces Ocean for company search) ────────────────────────────
APOLLO_API_KEY = os.getenv("APOLLO_API_KEY", "")
APOLLO_API_URL = os.getenv("APOLLO_API_URL", "https://api.apollo.io/v1")

# ── Prospeo (contact finder) ──────────────────────────────────────────────────
PROSPEO_API_KEY = os.getenv("PROSPEO_API_KEY", "")
PROSPEO_API_URL = os.getenv("PROSPEO_API_URL", "https://api.prospeo.io")

# ── EazyReach (legacy, not used if ZeroBounce key is set) ────────────────────
EAZYREACH_API_KEY = os.getenv("EAZYREACH_API_KEY", "")
EAZYREACH_API_URL = os.getenv("EAZYREACH_API_URL", "https://api.eazyreach.io/v1")

# ── ZeroBounce (replaces EazyReach for email verification) ───────────────────
ZEROBOUNCE_API_KEY = os.getenv("ZEROBOUNCE_API_KEY", "")

# ── Brevo (email sending) ─────────────────────────────────────────────────────
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@example.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Outreach Engine")

# ── Gemini (AI email generation) ──────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── General ───────────────────────────────────────────────────────────────────
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
MAX_SIMILAR = int(os.getenv("MAX_SIMILAR", "5"))
MAX_CONTACTS_PER_COMPANY = int(os.getenv("MAX_CONTACTS_PER_COMPANY", "2"))
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "20"))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "10"))
HTTP_MAX_CONNECTIONS = int(os.getenv("HTTP_MAX_CONNECTIONS", "20"))
HTTP_MAX_KEEPALIVE = int(os.getenv("HTTP_MAX_KEEPALIVE", "10"))
