from email_generator import generate


def _contact(**overrides):
    base = {
        "first_name": "Avery",
        "last_name": "Chen",
        "company": "Acme",
        "title": "CTO",
        "industry": "Developer Tools",
    }
    base.update(overrides)
    return base


def test_generate_uses_contact_fields():
    out = generate(_contact(), sender_company="MyCo")
    assert "Avery" in out["body"]
    assert "Acme" in out["body"]
    assert "Developer Tools" in out["body"]
    assert "MyCo" in out["body"]
    assert "reducing time-to-first-value" in out["body"]


def test_generate_falls_back_to_default_pain_point():
    out = generate(_contact(industry=None))
    assert "growing pipeline" in out["body"]


def test_generate_handles_missing_optional_fields():
    out = generate({"first_name": "Sam"}, sender_company="X")
    assert "Hi Sam" in out["body"]
    assert "your company" in out["body"]


def test_generate_subject_uses_company_and_title():
    out = generate(_contact(company="Globex", title="VP Engineering"))
    assert out["subject"] == "Quick idea for Globex's VP Engineering"


def test_generate_falls_back_when_gemini_not_live(monkeypatch):
    monkeypatch.setattr("services.gemini.is_live", lambda: False)
    out = generate(_contact(company="FallbackCo", title="VP Engineering"))
    assert "Quick idea for FallbackCo's VP Engineering" == out["subject"]
    assert "The Outreach team" in out["body"]


def test_generate_uses_gemini_when_live(monkeypatch):
    monkeypatch.setattr("services.gemini.is_live", lambda: True)
    
    expected = {"subject": "Gemini Subject", "body": "Gemini Body"}
    monkeypatch.setattr(
        "services.gemini.generate_email",
        lambda contact, sender_company: expected
    )
    
    out = generate(_contact())
    assert out == expected


def test_generate_falls_back_when_gemini_fails(monkeypatch):
    monkeypatch.setattr("services.gemini.is_live", lambda: True)
    
    def fail(contact, sender_company):
        raise RuntimeError("API failure")
        
    monkeypatch.setattr("services.gemini.generate_email", fail)
    
    out = generate(_contact(company="ErrorCo"))
    assert "Quick idea for ErrorCo's" in out["subject"]
