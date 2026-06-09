# Outreach Automation Engine  

A **premium, end‑to‑end B2B outreach platform** that turns a single domain name into a ready‑to‑send, personalized email sequence. The backend (FastAPI) stitches together **company discovery**, **decision‑maker lookup**, **email verification**, and **AI‑generated copy**; the frontend (Vite + React) offers a sleek, glass‑morphic UI for quick domain entry and result inspection.

---  

## Table of Contents  

1. [Features](#features)  
2. [Architecture Overview](#architecture-overview)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
   - [Backend](#backend-setup)  
   - [Frontend](#frontend-setup)  
5. [Configuration & Environment Variables](#configuration)  
6. [API Reference](#api-reference)  
7. [Testing](#testing)  
8. [Deployment](#deployment)  
9. [Contributing](#contributing)  
10. [License](#license)  

---  

## Features  

- **Domain → Similar Companies** – Powered by **Ocean.io** (live) or deterministic mock data.  
- **Decision‑Maker Extraction** – Uses **Prospeo** (live) or mock contacts.  
- **Email Hygiene** – Validates every address via **ZeroBounce** (live) with graceful fallback.  
- **AI‑Generated Outreach** – Generates subject + body with **Google Gemini** (live) or returns static mock content.  
- **Send via Brevo** – Transactional email delivery using Brevo’s API.  
- **Live‑vs‑Mock Mode** – Each service automatically switches to mock data when the corresponding API key is missing, enabling instant demos.  
- **Health‑Check Endpoint** – `/api/health` reports which services are live.  
- **Docker‑ready & Render‑compatible** – Simple `uvicorn` start command works on any cloud VM.  

---  

## Architecture Overview  

```mermaid
flowchart TD
    subgraph Frontend
        UI[DomainForm.jsx] --> Proxy[Proxy /api/* → Backend]
    end
    subgraph Backend
        API[FastAPI] --> |POST /pipeline/run| Pipeline
        Pipeline --> Ocean[Ocean.io service] --> Companies
        Pipeline --> Prospeo[Prospeo service] --> Contacts
        Pipeline --> ZeroBounce[ZeroBounce service] --> VerifiedEmails
        Pipeline --> Gemini[Gemini service] --> EmailContent
        EmailContent --> Brevo[Brevo service] --> SentMail
    end
    Companies --> Pipeline
    Contacts --> Pipeline
    VerifiedEmails --> Pipeline
    EmailContent --> Pipeline
    classDef live fill:#b3e5fc,stroke:#0288d1;
    class Ocean,Prospeo,ZeroBounce,Gemini,Brevo live;
  
All services live under backend/services/.
Apollo is a fallback company‑search service, not currently part of the main pipeline but available for custom extensions.


## Tech Stack  

| Layer          | Technology                                 |
|----------------|--------------------------------------------|
| **Backend**    | Python 3.12, FastAPI, httpx (async client)|
| **Frontend**   | Vite + React, JSX, CSS modules (custom design system) |
| **AI**         | Google Gemini (`google-genai` SDK)        |
| **Email**      | Brevo transactional API                    |
| **Data Sources**| Ocean.io, Prospeo, ZeroBounce            |
| **Testing**    | pytest, pytest‑asyncio                     |
| **Deployment** | Render (Python), Vercel (React)           |
| **Version Control**| Git (repo hosted on GitHub)           |


## Getting Started  

> **Prerequisites** – Python 3.12+, Node ≥ 18, and a Windows PowerShell terminal (the project is Windows‑first, but all scripts are cross‑platform).

### **Backend Setup**  

```bash
# 1️⃣ **Clone** the repo (if you haven't already)
git clone https://github.com/<your‑username>/outreach-engine.git
cd outreach-engine/backend

# 2️⃣ **Create a virtual environment**
python -m venv .venv
.\.venv\Scripts\activate   # PowerShell
# (on macOS/Linux: source .venv/bin/activate)

# 3️⃣ **Install dependencies**
pip install -r requirements.txt

# 4️⃣ **Copy the example env file and fill in your API keys**
cp .env.example .env
# Edit .env → set OCEAN_API_KEY, PROSPEO_API_KEY, ZEROBOUNCE_API_KEY,
#               GEMINI_API_KEY, BREVO_API_KEY, BREVO_SENDER_EMAIL, etc.

# 5️⃣ **Run the API** (auto‑reload for development)
uvicorn main:app --reload --port 8000


The FastAPI docs are now reachable at: http://127.0.0.1:8000/docs


cd ../frontend

# **Install dependencies**
npm install

# **Copy the env example and point to the backend URL**
cp .env.example .env
# Edit .env → set VITE_BACKEND_URL=http://127.0.0.1:8000

# **Start the dev server** (Vite hot‑reload)
npm run dev



**Key points**

- Wrap any phrase you want bold with `**` (or `__`).  
- Keep the surrounding markdown structure (headings, blockquotes, code fences) unchanged.  
- When you paste the snippet into `README.md` and push it, GitHub will render the bolded words automatically.

Just replace the placeholder `<your‑username>` with your actual GitHub username (or organization) and you’re good to go! 🚀
## Configuration & Environment Variables  

All configurable values live in `backend/.env` (generated from `.env.example`).  

| Variable | Service | Required for | Description |
|----------|---------|-------------|-------------|
| `OCEAN_API_KEY` | Ocean.io | Company discovery | Live API key – omit to use mock companies. |
| `PROSPEO_API_KEY` | Prospeo | Decision‑maker lookup | Live API key – omit to use mock contacts. |
| `ZEROBOUNCE_API_KEY` | ZeroBounce | Email validation | Live API key – omit to use mock verification. |
| `GEMINI_API_KEY` | Gemini | AI email generation | Live API key – omit to raise an error (no mock). |
| `BREVO_API_KEY` | Brevo | Transactional sending | Required for real email sends. |
| `BREVO_SENDER_EMAIL` | Brevo | Transactional sending | Verified sender address in your Brevo account. |
| `MAX_SIMILAR` | Pipeline | Company discovery | Max number of similar companies (default 10). |
| `MAX_CONTACTS_PER_COMPANY` | Pipeline | Contact lookup | Max contacts per company (default 5). |
| `CORS_ORIGINS` | FastAPI | CORS handling | Comma‑separated whitelist (default `*`). |

> **Tip:** Services automatically switch to mock mode when the corresponding key is absent (`bool(API_KEY)`), making demoing the entire pipeline a single click.

---  

## API Reference  

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| `POST` | `/api/pipeline/run` | Execute full outreach pipeline for a domain. | `{ "domain": "example.com" }` | `{ "companies": [...], "contacts": [...], "emails": [...], "email_content": [...] }` |
| `POST` | `/api/email/send` | Send a pre‑generated email via Brevo. | `{ "recipient": "a@b.com", "subject": "...", "body": "..." }` | `{ "message_id": "...", "status": "queued" }` |
| `GET`  | `/api/health` | Health‑check – shows which services are live vs. mock. | — | `{ "apollo": "live", "prospeo": "mock", "zerobounce": "live", "gemini": "mock", ... }` |
| `GET`  | `/api/health` *(alias)* | Same as above – kept for backward compatibility. | — | Same as above. |

Full OpenAPI schema is served at **/docs** and **/openapi.json**.

---  

## Testing  

```bash
# From the backend folder
pytest -q
## Backend Deployment (Render)

Render is a fully‑managed cloud platform that will run the FastAPI service for you. Follow these steps to get the backend up and running in **minutes**.

### 1️⃣ Create a Render Service  

| Field | Value |
|-------|-------|
| **Service Type** | **Web Service** (Python) |
| **Name** | `outreach-backend` (or any name you prefer) |
| **Region** | Auto‑select (closest to your users) |
| **Branch** | `main` (or the branch you want to deploy) |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Environment** | **Docker** (Render will auto‑detect a Python runtime) |

### 2️⃣ Add Environment Variables  

Render expects the same `.env` keys used locally. In the **Environment** tab add each variable (do **not** commit secrets to the repo):


*Leave any key blank if you want that service to run in **mock** mode.*

### 3️⃣ Optional – Health‑Check  

Render automatically pings the service’s root URL. To give it a proper health endpoint, add the following **Health Check Path** in the service settings:


This will return a JSON payload indicating which services are live vs. mock.

### 4️⃣ Deploy  

- Click **Create Web Service**.  
- Render will clone the repo, install dependencies, and start `uvicorn`.  
- Once the **Live URL** appears (e.g., `https://outreach-backend.onrender.com`), you can use that URL as `VITE_BACKEND_URL` in the frontend.

### 5️⃣ Verify  

Open the live URL in a browser:


You should see something like:

```json
{
  "apollo": "live",
  "prospeo": "mock",
  "zerobounce": "live",
  "gemini": "mock",
  "brevo": "live"
}
# Use the official Python slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code
COPY . .

# Expose the default FastAPI port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# From the repository root
cd backend
docker build -t outreach-backend:latest .

# Run with environment variables (replace <value> with your real keys)
docker run -d \
  -p 8000:8000 \
  -e OCEAN_API_KEY=<value> \
  -e PROSPEO_API_KEY=<value> \
  -e ZEROBOUNCE_API_KEY=<value> \
  -e GEMINI_API_KEY=<value> \
  -e BREVO_API_KEY=<value> \
  -e BREVO_SENDER_EMAIL=<value> \
  --name outreach-backend \
  outreach-backend:latest


#gemini api keys are being deavtivated due to payment issue 