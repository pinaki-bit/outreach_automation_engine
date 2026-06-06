# Outreach Automation Engine

End-to-end pipeline: domain -> similar companies (Ocean.io) -> decision makers
(Prospeo) -> verified emails (EazyReach) -> personalized outreach (template) ->
sent via Brevo.

## Project Structure

```
outreach-engine/
  backend/    FastAPI service
  frontend/   Vite + React UI
```

## Quick Start

### Backend

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate           # Windows
# source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
cp .env.example .env             # then fill in API keys
uvicorn main:app --reload --port 8000
```

Health check: <http://127.0.0.1:8000/api/health>

### Frontend

```sh
cd frontend
npm install
cp .env.example .env             # set VITE_BACKEND_URL
npm run dev                      # http://127.0.0.1:5173
```

The Vite dev server proxies `/api/*` to the backend configured by
`VITE_BACKEND_URL` (default `http://127.0.0.1:8000`).

## API

### `POST /api/pipeline/run`

```json
{ "domain": "openai.com" }
```

Returns `{ companies, contacts, emails, email_content }`.

The backend also accepts `/pipeline/run`, `/email/send`, and `/health` aliases
for the unprefixed endpoint paths in the original spec.

### `POST /api/email/send`

```json
{ "recipient": "a@example.com", "subject": "...", "body": "..." }
```

## Configuration

| Variable | Required for | Notes |
|---|---|---|
| `OCEAN_API_KEY` | Ocean.io live | Falls back to mock when empty |
| `PROSPEO_API_KEY` | Prospeo live | Falls back to mock when empty |
| `EAZYREACH_API_KEY` | EazyReach live | Falls back to mock when empty |
| `BREVO_API_KEY` | Brevo sending | Send returns an error when empty |
| `BREVO_SENDER_EMAIL` | Brevo sending | Verified sender on your Brevo account |
| `CORS_ORIGINS` | CORS | Comma-separated list, default `*` |
| `MAX_SIMILAR` | Pipeline | Default 10 |
| `MAX_CONTACTS_PER_COMPANY` | Pipeline | Default 5 |

`/api/health` reports which services are live vs. mock.

## Tests

```sh
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
pip install pytest
pytest -q
```

## Deployment

- **Frontend (Vercel):** root `frontend/`, build command `npm run build`,
  output `dist`. Set `VITE_BACKEND_URL` to the Render URL.
- **Backend (Render):** root `backend/`, build command
  `pip install -r requirements.txt`, start command
  `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set the same env vars
  as `backend/.env.example`.
