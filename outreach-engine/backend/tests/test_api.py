from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_endpoint():
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert "mode" in body
    assert set(body["mode"].keys()) == {"company_search", "contact_finder", "email_verify", "email_send", "ai_generate"}


def test_pipeline_run_returns_companies_contacts_emails_content():
    r = client.post(
        "/api/pipeline/run",
        json={"domain": "openai.com"},
    )
    assert r.status_code == 200
    body = r.json()

    assert "companies" in body and isinstance(body["companies"], list)
    assert "contacts" in body and isinstance(body["contacts"], list)
    assert "emails" in body and isinstance(body["emails"], list)
    assert "email_content" in body and isinstance(body["email_content"], dict)

    assert len(body["companies"]) > 0
    assert len(body["contacts"]) > 0
    assert len(body["emails"]) == len(body["contacts"])

    for contact in body["contacts"]:
        assert contact["industry"]
        assert contact["first_name"]
        assert contact["company_domain"]

    for email in body["emails"]:
        assert "@" in email["email"]
        assert email["status"] in ("verified", "invalid", "catch-all", "unknown")

    for cid, content in body["email_content"].items():
        assert cid in [c["contact_id"] for c in body["contacts"]]
        assert content["subject"]
        assert content["body"]


def test_pipeline_run_rejects_empty_inputs():
    r = client.post("/api/pipeline/run", json={"domain": ""})
    assert r.status_code == 422


def test_unprefixed_pipeline_route_matches_spec(monkeypatch):
    # Mock all external services
    monkeypatch.setattr("services.apollo.is_live", lambda: False)
    monkeypatch.setattr("services.prospeo.is_live", lambda: False)
    monkeypatch.setattr("services.zerobounce.is_live", lambda: False)
    monkeypatch.setattr("services.gemini.is_live", lambda: False)
    
    r = client.post("/pipeline/run", json={"domain": "https://openai.com/research"})
    assert r.status_code == 200
    body = r.json()
    assert body["companies"]
    assert body["contacts"]
    assert len(body["companies"]) > 0
    assert len(body["contacts"]) > 0


def test_unprefixed_send_route_matches_spec(monkeypatch):
    monkeypatch.setattr("services.brevo.BREVO_API_KEY", "")
    r = client.post(
        "/email/send",
        json={"recipient": "a@b.com", "subject": "s", "body": "b"},
    )
    assert r.status_code == 502
    assert "BREVO_API_KEY" in r.json()["detail"]


def test_email_send_returns_502_without_brevo_key(monkeypatch):
    monkeypatch.setattr("services.brevo.BREVO_API_KEY", "")
    r = client.post(
        "/api/email/send",
        json={"recipient": "a@b.com", "subject": "s", "body": "b"},
    )
    assert r.status_code == 502
    assert "BREVO_API_KEY" in r.json()["detail"]


def test_email_send_rejects_empty_inputs():
    r = client.post(
        "/api/email/send",
        json={"recipient": "", "subject": "", "body": ""},
    )
    assert r.status_code == 422


def test_unprefixed_health_route_matches_spec():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert set(body["mode"].keys()) == {"company_search", "contact_finder", "email_verify", "email_send", "ai_generate"}


def test_pipeline_normalizes_www_prefix(monkeypatch):
    captured = {}
    mock_companies = [{"name": "TestCo", "domain": "testco.com", "industry": "SaaS", "size_range": "50-200"}]
    mock_contacts = [{"contact_id": "testco.com-0", "first_name": "Test", "last_name": "User", "company": "TestCo", "company_domain": "testco.com", "title": "CEO"}]
    
    async def mock_find_similar(name, domain):
        captured["domain"] = domain
        return mock_companies
    
    async def mock_find_contacts(*a, **k):
        return mock_contacts
    
    async def mock_verify(*a, **k):
        return {"status": "verified", "email": "test@testco.com"}
    
    monkeypatch.setattr("services.apollo.find_similar_async", mock_find_similar)
    monkeypatch.setattr("services.prospeo.find_contacts_async", mock_find_contacts)
    monkeypatch.setattr("services.zerobounce.verify_async", mock_verify)
    monkeypatch.setattr("services.gemini.is_live", lambda: False)
    
    r = client.post("/api/pipeline/run", json={"domain": "  WWW.OpenAI.com/  "})
    assert r.status_code == 200
    assert captured["domain"] == "openai.com"


def test_pipeline_normalizes_query_string_and_fragment(monkeypatch):
    captured = {}
    mock_companies = [{"name": "TestCo", "domain": "testco.com", "industry": "SaaS", "size_range": "50-200"}]
    mock_contacts = [{"contact_id": "testco.com-0", "first_name": "Test", "last_name": "User", "company": "TestCo", "company_domain": "testco.com", "title": "CEO"}]
    
    async def mock_find_similar(name, domain):
        captured["domain"] = domain
        return mock_companies
    
    async def mock_find_contacts(*a, **k):
        return mock_contacts
    
    async def mock_verify(*a, **k):
        return {"status": "verified", "email": "test@testco.com"}
    
    monkeypatch.setattr("services.apollo.find_similar_async", mock_find_similar)
    monkeypatch.setattr("services.prospeo.find_contacts_async", mock_find_contacts)
    monkeypatch.setattr("services.zerobounce.verify_async", mock_verify)
    monkeypatch.setattr("services.gemini.is_live", lambda: False)
    
    r = client.post("/api/pipeline/run", json={"domain": "openai.com?ref=tw#section"})
    assert r.status_code == 200
    assert captured["domain"] == "openai.com"


def test_pipeline_email_body_uses_known_brand_name(monkeypatch):
    mock_companies = [{"name": "OpenAI", "domain": "openai.com", "industry": "AI", "size_range": "50-200"}]
    mock_contacts = [{"contact_id": "openai.com-0", "first_name": "Sam", "last_name": "Altman", "company": "OpenAI", "company_domain": "openai.com", "title": "CEO"}]
    
    async def mock_find_similar(name, domain):
        return mock_companies
    
    async def mock_find_contacts(*a, **k):
        return mock_contacts
    
    async def mock_verify(*a, **k):
        return {"status": "verified", "email": "sam@openai.com"}
    
    monkeypatch.setattr("services.apollo.find_similar_async", mock_find_similar)
    monkeypatch.setattr("services.prospeo.find_contacts_async", mock_find_contacts)
    monkeypatch.setattr("services.zerobounce.verify_async", mock_verify)
    monkeypatch.setattr("services.gemini.is_live", lambda: False)
    
    r = client.post("/api/pipeline/run", json={"domain": "openai.com"})
    assert r.status_code == 200
    body = r.json()
    bodies = [c["body"] for c in body["email_content"].values()]
    assert bodies, "expected at least one generated email body"
    assert any("OpenAI" in b for b in bodies), "expected 'OpenAI' brand casing"


def test_cors_origins_strips_whitespace(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "http://a.com, http://b.com , http://c.com")
    import importlib
    import config
    importlib.reload(config)
    assert config.CORS_ORIGINS == ["http://a.com", "http://b.com", "http://c.com"]


def test_eazyreach_mock_handles_missing_company_domain():
    from services import eazyreach
    contact = {
        "contact_id": "x-0",
        "first_name": "Avery",
        "last_name": "Chen",
        "company": "X",
    }
    out = eazyreach.verify(contact)
    assert out["status"] == "verified"
    assert out["email"].endswith("@example.com")
