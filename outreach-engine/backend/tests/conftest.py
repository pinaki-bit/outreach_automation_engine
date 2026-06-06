"""
Shared pytest fixtures.

The tests assume all services are in mock mode (no API keys in the
environment). This keeps the suite hermetic and free of paid calls.
"""
import os

os.environ.setdefault("OCEAN_API_KEY", "")
os.environ.setdefault("PROSPEO_API_KEY", "")
os.environ.setdefault("EAZYREACH_API_KEY", "")
os.environ.setdefault("BREVO_API_KEY", "")
os.environ.setdefault("BREVO_SENDER_EMAIL", "noreply@example.com")
os.environ.setdefault("BREVO_SENDER_NAME", "Outreach Engine")
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("CORS_ORIGINS", "*")
os.environ.setdefault("MAX_SIMILAR", "3")
os.environ.setdefault("MAX_CONTACTS_PER_COMPANY", "2")
os.environ.setdefault("HTTP_TIMEOUT", "5")
