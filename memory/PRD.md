# GrantPulse — PRD

## Problem Statement (verbatim)
Build GrantPulse: a high-stakes B2B autonomous agent platform for grant discovery and automated proposal drafting. Scouts SAM.gov/Grants.gov on a 4-hour cron, vets RFPs against a Company Persona (PoW ≥ 85%), autonomously notifies users, drafts full responses using past successful proposals as tone references, and enforces a Trust Boundary — the agent can draft but cannot submit without a manual "Approve & Submit" click. Monetization: Free tier = 1 lead/month; Pro tier = $199/mo for unlimited scouting + AI drafting.

## User Choices Gathered
- Database: **MongoDB** (not PostgreSQL)
- Scout source: **Grants.gov public API** (api.grants.gov/v1/api/search2)
- LLM: **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) via **Emergent Universal Key**, with **GPT-5.1** as automatic fallback
- Notifications: **in-app only** (Wingman/WhatsApp deferred)
- Payments: **Stripe test key** (pre-configured via `STRIPE_API_KEY=sk_test_emergent`)
- Niche: **niche-agnostic** (user defines their own via Company Persona)

## Architecture
- **Backend:** FastAPI single-file (`/app/backend/server.py`). MongoDB via Motor. APScheduler runs `scout_all_users` every 4 hours. LLM calls offloaded to a thread pool via `asyncio.to_thread` so the event loop stays responsive during long generations.
- **Frontend:** React + React Router + Tailwind + Shadcn UI. Executive Dark Mode (pure black + amber accents). Cabinet Grotesk (display) + IBM Plex Sans/Mono (body/data).
- **Storage:** Emergent object-storage for past-proposal PDFs; pypdf extracts text for LLM context.
- **Auth:** JWT (bcrypt + HS256). Admin seeded on startup.

## Implemented (2026-04-22)
### Backend (`/app/backend/server.py`)
- `POST /api/auth/signup`, `/api/auth/login`, `GET /api/auth/me`
- `PUT /api/persona`, `GET /api/persona`
- `POST /api/scout/run` — live Grants.gov fetch → score each result with Claude Sonnet 4.5 → store with PoW score, reasoning, 3-sentence summary
- Auto-cron every 4 hours for all Pro users
- `GET /api/grants` (free tier locks results beyond index 0), `GET /api/grants/{id}`, `POST /api/grants/{id}/stage`
- `POST /api/grants/{id}/draft` — **async background generation** with polling pattern (Pro-only)
- `PUT /api/drafts/{id}`, `POST /api/drafts/{id}/approve` (Trust Boundary)
- `POST /api/vault/upload` (PDF), `GET /api/vault`, `DELETE /api/vault/{id}`
- `GET /api/dashboard/metrics`, `GET /api/notifications`
- `POST /api/payments/checkout` (fixed $199 pro_monthly package), `GET /api/payments/status/{session_id}`, `POST /api/webhook/stripe`
- LLM retry/fallback: claude primary → gpt-5.1 fallback; fail-fast on budget-exceeded errors with user-friendly message.

### Frontend
- `/` Landing (amber-accent dark hero, pricing tiers)
- `/signup`, `/login` (split-screen executive layout)
- `/dashboard` (metrics grid, recent matches, notifications feed, Run Scout button)
- `/pipeline` (4-column Kanban: Matched → Drafting → Review → Submitted; free-tier lock badges)
- `/grants/:id` (PoW score, match analysis, executive summary, Generate Draft button, textarea editor, Trust Boundary approval modal)
- `/persona` (chip-input fields for capabilities/keywords/geo + past-performance entries)
- `/vault` (PDF drop zone, file list, delete)
- `/pricing` ($199/mo upgrade flow → Stripe Checkout)
- `/success` (Stripe polling with plan refresh)

## Test Credentials
See `/app/memory/test_credentials.md`. Admin: `admin@grantpulse.io / Admin@12345` (Pro).

## Known Limitation
- Emergent universal key budget exhausted during development/testing — triggers a friendly "top up your balance" error on the Generate Draft flow. All other flows operate normally. Refill via Profile → Universal Key → Add Balance.

## Backlog / Next Actions (P0 → P2)
### P0
- [ ] Convert $199 one-time Stripe payment into a true recurring subscription (Stripe Price ID + webhook for renewal/cancel).
- [ ] Add WhatsApp/Telegram Wingman notifications (currently in-app only).
### P1
- [ ] Add SAM.gov scraper (Grants.gov API covers federal grants; SAM.gov has contracts and uses a different API).
- [ ] Split `server.py` into routers (`auth.py`, `grants.py`, `drafts.py`, `vault.py`, `payments.py`).
- [ ] Parallelize `score_grant_vs_persona` calls in the scout using `asyncio.Semaphore(5)`.
- [ ] Add rate limiting on `/api/scout/run` (free users).
- [ ] Paginate `/api/grants` listing.
### P2
- [ ] Admin role dashboard (system metrics, user management).
- [ ] Persistent long-term memory of user feedback on drafts to tune future outputs.
- [ ] Mobile PWA manifest + service worker for offline install.
- [ ] Export approved drafts as DOCX/PDF.

## Personas
- **Grants Operator** (primary): small/mid-sized firm BD lead. Wants high-signal RFP feed and fast, on-brand drafts. Pro tier.
- **Executive Reviewer**: sanity-checks & approves drafts before submission.
- **Admin (GrantPulse staff)**: monitors platform health, manages users.
