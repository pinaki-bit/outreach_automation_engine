import logging
from services import gemini

log = logging.getLogger(__name__)

INDUSTRY_PAIN_POINTS = {
    "Artificial Intelligence": "scaling model evaluation pipelines without burning engineering time",
    "Developer Tools": "reducing time-to-first-value for new developers",
    "Cloud Infrastructure": "controlling cloud spend while keeping reliability high",
    "Cybersecurity": "cutting alert fatigue for security teams",
    "Fintech": "shipping compliant features at startup speed",
    "Healthtech": "meeting HIPAA-style requirements without slowing product",
    "E-commerce": "lifting conversion on first-time visitors",
    "SaaS": "converting free users into paying accounts",
}

FALLBACK_PAIN_POINT = "growing pipeline without adding headcount"


def _pain_point(industry: str | None) -> str:
    if not industry:
        return FALLBACK_PAIN_POINT
    return INDUSTRY_PAIN_POINTS.get(industry, FALLBACK_PAIN_POINT)


def generate_template(contact: dict, sender_company: str | None = None) -> dict:
    first = contact.get("first_name", "there")
    company = contact.get("company", "your company")
    title = contact.get("title", "")
    industry = contact.get("industry")
    pain = _pain_point(industry)
    sender = sender_company or "Outreach"

    subject = f"Quick idea for {company}'s {title or 'team'}"
    body = (
        f"Hi {first},\n\n"
        f"I noticed {company} is in the {industry or 'B2B'} space, and I work with "
        f"teams focused on {pain}. Most of the folks I talk to in your seat are "
        f"spending too much time on manual workarounds that don't move the needle.\n\n"
        f"Would you be open to a 15-minute call next week to see if there's a fit?\n\n"
        f"Best,\n"
        f"The {sender} team"
    )
    return {"subject": subject, "body": body}


def generate(contact: dict, sender_company: str | None = None) -> dict:
    if gemini.is_live():
        try:
            return gemini.generate_email(contact, sender_company)
        except Exception as e:
            log.warning("Gemini email generation failed (%s); falling back to template", e)
    return generate_template(contact, sender_company)
