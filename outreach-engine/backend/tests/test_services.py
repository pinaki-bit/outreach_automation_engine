from services import ocean, prospeo, eazyreach, brevo


def test_ocean_mock_returns_deterministic_companies():
    a = ocean.find_similar("OpenAI", "openai.com")
    b = ocean.find_similar("OpenAI", "openai.com")
    assert a == b
    assert len(a) == 3
    assert all({"name", "domain", "industry", "size_range"} <= set(c) for c in a)


def test_ocean_mock_respects_max_similar(monkeypatch):
    monkeypatch.setattr("services.ocean.MAX_SIMILAR", 2)
    out = ocean.find_similar("X", "x.com")
    assert len(out) == 2


def test_prospeo_mock_returns_deterministic_contacts():
    a = prospeo.find_contacts("Acme", "acme.com")
    b = prospeo.find_contacts("Acme", "acme.com")
    assert a == b
    assert len(a) == 2
    assert all(c["company_domain"] == "acme.com" for c in a)
    assert all(c["contact_id"].startswith("acme.com-") for c in a)


def test_eazyreach_mock_produces_valid_email():
    contact = {
        "contact_id": "x.com-0",
        "first_name": "Avery",
        "last_name": "Chen",
        "company": "X",
        "company_domain": "x.com",
    }
    out = eazyreach.verify(contact)
    assert out["contact_id"] == "x.com-0"
    assert out["status"] == "verified"
    assert out["email"].endswith("@x.com")
    assert "@" in out["email"]


def test_brevo_returns_clear_error_without_key(monkeypatch):
    monkeypatch.setattr("services.brevo.BREVO_API_KEY", "")
    out = brevo.send("a@b.com", "subj", "body")
    assert out["ok"] is False
    assert "BREVO_API_KEY" in out["error"]


def test_health_flags_modes(monkeypatch):
    monkeypatch.setattr("services.brevo.BREVO_API_KEY", "")
    monkeypatch.setattr("services.ocean.OCEAN_API_KEY", "")
    monkeypatch.setattr("services.prospeo.PROSPEO_API_KEY", "")
    monkeypatch.setattr("services.eazyreach.EAZYREACH_API_KEY", "")
    assert ocean.is_live() is False
    assert prospeo.is_live() is False
    assert eazyreach.is_live() is False
    assert brevo.is_live() is False
