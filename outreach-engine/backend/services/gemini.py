"""
Gemini email generation service.
"""
import json
import logging

from google import genai
from pydantic import BaseModel, Field
from config import GEMINI_API_KEY

log = logging.getLogger(__name__)


class EmailResponse(BaseModel):
    subject: str = Field(description="The subject line of the outreach email")
    body: str = Field(description="The body text of the outreach email")


def is_live() -> bool:
    return bool(GEMINI_API_KEY)


def _build_prompt(contact: dict, sender_company: str | None = None) -> str:
    first = contact.get("first_name", "there")
    company = contact.get("company", "your company")
    title = contact.get("title", "")
    industry = contact.get("industry", "")
    sender = sender_company or "Outreach"

    return (
        f"You are an expert outreach copywriter. Generate a **JSON** object with two fields: `subject` (a concise email subject line) and `body` (the email body).\n"
        f"\n"
        f"Use the following prospect information exactly as provided (do not invent any data):\n"
        f"- Name: {first}\n"
        f"- Job Title: {title if title else 'N/A'}\n"
        f"- Company: {company}\n"
        f"- Industry: {industry if industry else 'N/A'}\n"
        f"- Sender Company: {sender}\n"
        f"\n"
        f"Write a short, professional but friendly email (max 150 words) that mentions a real challenge for the given industry and explains how {sender} can help. End with a soft call\u2011to\u2011action.\n"
        f"\n"
        f"Respond **only** with the JSON object, no extra text."
    )


def _parse_response(response) -> dict:
    try:
        if hasattr(response, 'parsed') and response.parsed:
            return {
                "subject": response.parsed.subject,
                "body": response.parsed.body,
            }
        data = json.loads(response.text)
        if not isinstance(data, dict) or "subject" not in data or "body" not in data:
            raise ValueError("Gemini response missing required fields")
        return {
            "subject": data["subject"],
            "body": data["body"],
        }
    except Exception as e:
        log.error("Gemini generation failed or returned malformed JSON: %s", e)
        raise


def generate_email(contact: dict, sender_company: str | None = None) -> dict:
    if not is_live():
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = _build_prompt(contact, sender_company)

    response = client.models.generate_content(
        model='gemini-3.1-flash-lite',
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': EmailResponse,
        },
    )

    return _parse_response(response)


def generate_email_with_style(
    contact: dict,
    sender_company: str | None = None,
    style_hint: str = "",
) -> dict:
    """Re-generate an email with a user-specified writing style/preference."""
    if not is_live():
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    first = contact.get("first_name", "there")
    company = contact.get("company", "your company")
    title = contact.get("title", "")
    industry = contact.get("industry", "")
    sender = sender_company or "Outreach"

    prompt = (
        f"You are an expert outreach copywriter. Generate a **JSON** object with two fields: `subject` (a concise email subject line) and `body` (the email body).\n"
        f"\n"
        f"Use the following prospect information exactly as provided (do not invent any data):\n"
        f"- Name: {first}\n"
        f"- Job Title: {title if title else 'N/A'}\n"
        f"- Company: {company}\n"
        f"- Industry: {industry if industry else 'N/A'}\n"
        f"- Sender Company: {sender}\n"
        f"\n"
        f"**Writing style instructions from the user**: {style_hint}\n"
        f"\n"
        f"Write a short, professional email (max 150 words) following the user's style instructions above. "
        f"Mention a real challenge for the given industry and explain how {sender} can help. End with a soft call\u2011to\u2011action.\n"
        f"\n"
        f"Respond **only** with the JSON object, no extra text."
    )

    response = client.models.generate_content(
        model='gemini-3.1-flash-lite',
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': EmailResponse,
        },
    )

    return _parse_response(response)
