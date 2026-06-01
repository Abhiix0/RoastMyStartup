# RoastMyStartup — Backend

FastAPI backend for RoastMyStartup. Handles AI roast generation via Google Gemini, Google OAuth, JWT authentication, and roast persistence in Supabase.

---

## Stack

- Python 3.11+
- FastAPI 0.104
- Google Gemini (`gemini-2.5-flash`) via `google-generativeai`
- Supabase (PostgreSQL) via `supabase-py`
- Google OAuth 2.0 (server-side flow)
- PyJWT for token signing
- slowapi for rate limiting
- tenacity for AI retry logic

---

## Project Structure
backend/
├── app/
│   ├── main.py              # App entry point, routes, middleware
│   ├── config/
│   │   └── settings.py      # Pydantic settings, env var loading
│   ├── routes/
│   │   └── auth.py          # Google OAuth endpoints
│   ├── schemas/
│   │   └── roast.py         # RoastRequest and RoastResponse models
│   └── services/
│       ├── roast_service.py  # Gemini AI generation with retry logic
│       └── db_service.py     # Supabase CRUD operations
├── tests/
│   ├── test_api.py
│   ├── test_gemini.py
│   ├── test_hardened_service.py
│   └── test_supabase_integration.py
├── SUPABASE_MIGRATION.sql    # Run this once before first launch
├── requirements.txt
└── .env.example
---

## Setup

### 1. Create and activate a virtual environment

```bash
python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in all required values in `.env`. See the environment variables table below.

### 4. Run the database migration

Before starting the server for the first time, run the migration against your Supabase project. Paste the contents of `SUPABASE_MIGRATION.sql` into the Supabase SQL editor and execute it.

This creates the `users`, `roasts`, and `login_events` tables with the correct schema, foreign keys, and indexes.

### 5. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Available URLs

| URL | Description |
|---|---|
| `http://localhost:8000` | Root — confirms API is running |
| `http://localhost:8000/health` | Health check — DB and model status |
| `http://localhost:8000/docs` | Interactive API docs (Swagger UI) |
| `http://localhost:8000/redoc` | Alternative API docs (ReDoc) |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon or service key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes | Must match exactly what's registered in Google Cloud Console |
| `JWT_SECRET_KEY` | Yes | Generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | No | Default: `HS256` |
| `JWT_EXPIRATION_HOURS` | No | Default: `24` |
| `FRONTEND_BASE_URL` | No | Used to construct the post-OAuth redirect URL. Default: `http://localhost:8080` |
| `DEBUG` | No | Default: `False` |

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "alive", model, database }` |
| `GET` | `/stats` | Returns aggregate roast counts by level |
| `GET` | `/auth/google` | Redirects user to Google OAuth consent screen |
| `GET` | `/auth/google/callback` | Handles OAuth callback, issues JWT, redirects to frontend |

### Authenticated

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/roast` | Optional Bearer | Generate a roast. Rate limited to 10 requests/min per IP. Authenticated users are limited to 6 free roasts, enforced server-side. |
| `GET` | `/user/roasts` | Required Bearer | Returns the authenticated user's full roast history, ordered by date descending. |

### POST /roast — Request Body

```json
{
  "startup_name": "string",
  "idea_description": "string",
  "target_users": "string",
  "budget": "string",
  "roast_level": "Soft" | "Medium" | "Nuclear"
}
```

### POST /roast — Response

```json
{
  "brutal_roast": "string",
  "honest_feedback": "string",
  "competitor_reality_check": "string",
  "survival_tips": ["string"],
  "pitch_rewrite": "string"
}
```

---

## Authentication Flow

1. Frontend redirects user to `GET /auth/google`
2. Backend redirects user to Google's OAuth consent screen
3. Google redirects back to `GET /auth/google/callback` with an authorization code
4. Backend exchanges the code for a Google access token, fetches the user's profile, upserts the user in Supabase, and issues a signed JWT
5. Backend redirects to `{FRONTEND_BASE_URL}/auth/callback?token=<jwt>`
6. Frontend stores the JWT in `localStorage` and uses it as `Authorization: Bearer <token>` on subsequent requests

---

## Roast Levels

| Level | Behavior |
|---|---|
| Soft | Constructive, encouraging tone with light critique |
| Medium | Direct, VC-style feedback without sugarcoating |
| Nuclear | Ruthless, sarcastic — no mercy |

---

## Rate Limiting

The `/roast` endpoint is rate limited to **10 requests per minute per IP address** using slowapi. Exceeding the limit returns `HTTP 429 Too Many Requests`.

Additionally, authenticated users are limited to **6 free roasts** total, checked against the database on every request.