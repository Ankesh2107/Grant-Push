"""GrantPulse backend regression tests."""
import os
import io
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grant-wingman.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@grantpulse.io"
ADMIN_PASSWORD = "Admin@12345"

# Unique test user for this run
TEST_EMAIL = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPass@12345"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    data = r.json()
    assert "token" in data
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def test_user(session):
    """Signup new free user."""
    r = session.post(f"{API}/auth/signup", json={
        "email": TEST_EMAIL, "password": TEST_PASSWORD, "company_name": "TEST Co"
    })
    assert r.status_code == 200, f"Signup failed: {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert "_id" not in data["user"], "user should not contain _id"
    assert "password" not in data["user"], "user should not contain password"
    assert data["user"]["plan"] == "free"
    return {"token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def user_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}


# ---- Health ----
def test_health(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---- Auth ----
class TestAuth:
    def test_signup_duplicate_rejected(self, session, test_user):
        r = session.post(f"{API}/auth/signup", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert r.status_code == 400

    def test_login_admin(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert "token" in r.json()
        assert r.json()["user"]["plan"] == "pro"

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, session, user_headers):
        r = session.get(f"{API}/auth/me", headers=user_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == TEST_EMAIL
        assert "password" not in data
        assert "_id" not in data

    def test_me_without_token(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---- Persona ----
class TestPersona:
    def test_save_and_get_persona(self, session, user_headers):
        payload = {
            "company_name": "TEST Co",
            "capabilities": ["AI/ML", "Cloud"],
            "technical_keywords": ["energy", "research"],
            "geographic_focus": ["US"],
            "narrative": "We do research."
        }
        r = session.put(f"{API}/persona", json=payload, headers=user_headers)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        r2 = session.get(f"{API}/persona", headers=user_headers)
        assert r2.status_code == 200
        d = r2.json()
        assert d["company_name"] == "TEST Co"
        assert d["technical_keywords"] == ["energy", "research"]


# ---- Dashboard ----
class TestDashboard:
    def test_metrics(self, session, user_headers):
        r = session.get(f"{API}/dashboard/metrics", headers=user_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_grants", "matched", "drafting", "review", "submitted", "high_match", "unread_notifications"]:
            assert k in d


# ---- Scout & Grants (heavy: LLM-backed) ----
class TestScoutAndGrants:
    @pytest.fixture(scope="class")
    def admin_persona_setup(self, session, admin_headers):
        # set persona on admin to ensure scout will run
        payload = {
            "company_name": "GrantPulse HQ",
            "capabilities": ["Energy Research", "Software"],
            "technical_keywords": ["energy", "research"],
            "geographic_focus": ["US"],
            "narrative": "Energy research org."
        }
        r = session.put(f"{API}/persona", json=payload, headers=admin_headers)
        assert r.status_code == 200
        return True

    def test_scout_run_admin(self, session, admin_headers, admin_persona_setup):
        # May take 30-90s due to LLM scoring
        r = session.post(f"{API}/scout/run", headers=admin_headers, timeout=180)
        assert r.status_code == 200, f"Scout failed: {r.text}"
        d = r.json()
        assert "scanned" in d
        assert "created" in d
        assert "high_match" in d
        # Allow 0 if Grants.gov returned nothing matching
        print(f"Scout result: {d}")

    def test_list_grants_admin(self, session, admin_headers):
        r = session.get(f"{API}/grants", headers=admin_headers)
        assert r.status_code == 200
        grants = r.json()
        assert isinstance(grants, list)
        # Pro user — none should be locked
        for g in grants:
            assert not g.get("locked", False), "Pro user should not have locked grants"

    def test_get_grant_detail_admin(self, session, admin_headers):
        r = session.get(f"{API}/grants", headers=admin_headers)
        grants = r.json()
        if not grants:
            pytest.skip("No grants to test detail")
        gid = grants[0]["id"]
        r2 = session.get(f"{API}/grants/{gid}", headers=admin_headers)
        assert r2.status_code == 200
        d = r2.json()
        assert "pow_score" in d
        assert "reasoning" in d
        assert "summary" in d

    def test_move_stage(self, session, admin_headers):
        r = session.get(f"{API}/grants", headers=admin_headers)
        grants = r.json()
        if not grants:
            pytest.skip("no grants")
        gid = grants[0]["id"]
        r2 = session.post(f"{API}/grants/{gid}/stage?stage=drafting", headers=admin_headers)
        assert r2.status_code == 200
        # verify
        r3 = session.get(f"{API}/grants/{gid}", headers=admin_headers)
        assert r3.json()["stage"] == "drafting"
        # restore
        session.post(f"{API}/grants/{gid}/stage?stage=matched", headers=admin_headers)

    def test_move_stage_invalid(self, session, admin_headers):
        r = session.get(f"{API}/grants", headers=admin_headers)
        grants = r.json()
        if not grants:
            pytest.skip("no grants")
        gid = grants[0]["id"]
        r2 = session.post(f"{API}/grants/{gid}/stage?stage=garbage", headers=admin_headers)
        assert r2.status_code == 400


# ---- Free tier gating ----
class TestFreeTier:
    def test_free_user_draft_blocked(self, session, user_headers):
        # Create a fake grant manually? No — call draft on any grant id, expect 402 first
        r = session.post(f"{API}/grants/fake-id/draft", headers=user_headers)
        # Since user is free, 402 should be returned BEFORE 404 lookup
        assert r.status_code == 402, f"Expected 402, got {r.status_code}: {r.text}"


# ---- Drafts (Pro only) ----
class TestDrafts:
    def test_create_draft_admin(self, session, admin_headers):
        r = session.get(f"{API}/grants", headers=admin_headers)
        grants = r.json()
        if not grants:
            pytest.skip("no grants to draft")
        gid = grants[0]["id"]
        r2 = session.post(f"{API}/grants/{gid}/draft", headers=admin_headers, timeout=180)
        assert r2.status_code == 200, f"Draft failed: {r2.text}"
        draft = r2.json()
        assert "id" in draft
        assert "content" in draft and len(draft["content"]) > 100
        assert draft["status"] == "review"
        # store globally
        pytest.draft_id = draft["id"]
        pytest.grant_id_for_draft = gid

    def test_get_draft(self, session, admin_headers):
        if not getattr(pytest, "draft_id", None):
            pytest.skip("no draft created")
        r = session.get(f"{API}/drafts/{pytest.draft_id}", headers=admin_headers)
        assert r.status_code == 200

    def test_approve_draft(self, session, admin_headers):
        if not getattr(pytest, "draft_id", None):
            pytest.skip("no draft created")
        r = session.post(f"{API}/drafts/{pytest.draft_id}/approve", headers=admin_headers)
        assert r.status_code == 200
        assert "submitted_at" in r.json()
        # verify grant stage moved to submitted
        r2 = session.get(f"{API}/grants/{pytest.grant_id_for_draft}", headers=admin_headers)
        assert r2.json()["stage"] == "submitted"


# ---- Notifications ----
class TestNotifications:
    def test_list_notifications(self, session, admin_headers):
        r = session.get(f"{API}/notifications", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---- Vault ----
class TestVault:
    def _make_pdf_bytes(self):
        # minimal valid PDF
        pdf = (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<<>>>>endobj\n"
            b"4 0 obj<</Length 44>>stream\nBT /F1 24 Tf 50 50 Td (Hello GrantPulse) Tj ET\nendstream endobj\n"
            b"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000054 00000 n \n0000000101 00000 n \n0000000183 00000 n \n"
            b"trailer<</Size 5/Root 1 0 R>>\nstartxref\n270\n%%EOF\n"
        )
        return pdf

    def test_upload_list_delete(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        files = {"file": ("test.pdf", self._make_pdf_bytes(), "application/pdf")}
        r = requests.post(f"{API}/vault/upload", headers=h, files=files, timeout=60)
        assert r.status_code == 200, f"Upload failed: {r.text}"
        d = r.json()
        assert "id" in d
        fid = d["id"]
        # list
        r2 = requests.get(f"{API}/vault", headers=h)
        assert r2.status_code == 200
        ids = [f["id"] for f in r2.json()]
        assert fid in ids
        # delete
        r3 = requests.delete(f"{API}/vault/{fid}", headers=h)
        assert r3.status_code == 200
        # verify gone
        r4 = requests.get(f"{API}/vault", headers=h)
        ids2 = [f["id"] for f in r4.json()]
        assert fid not in ids2

    def test_upload_non_pdf_rejected(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        files = {"file": ("test.txt", b"not a pdf", "text/plain")}
        r = requests.post(f"{API}/vault/upload", headers=h, files=files)
        assert r.status_code == 400


# ---- Stripe ----
class TestStripe:
    def test_checkout_creates_session(self, session, user_headers):
        r = session.post(f"{API}/payments/checkout", headers=user_headers, json={
            "package_id": "pro_monthly",
            "origin_url": "https://grant-wingman.preview.emergentagent.com"
        })
        assert r.status_code == 200, f"Checkout failed: {r.text}"
        d = r.json()
        assert "url" in d and d["url"].startswith("http")
        assert "session_id" in d
        pytest.stripe_session = d["session_id"]

    def test_checkout_invalid_package(self, session, user_headers):
        r = session.post(f"{API}/payments/checkout", headers=user_headers, json={
            "package_id": "hacker_attempt",
            "origin_url": "https://grant-wingman.preview.emergentagent.com"
        })
        assert r.status_code == 400

    def test_payment_status(self, session, user_headers):
        if not getattr(pytest, "stripe_session", None):
            pytest.skip("no session id")
        r = session.get(f"{API}/payments/status/{pytest.stripe_session}", headers=user_headers)
        assert r.status_code == 200
        assert "status" in r.json()
