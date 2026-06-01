# RoastMyStartup

Brutally honest AI feedback on startup ideas. Submit your idea, pick a roast intensity, and get unfiltered analysis across five dimensions: a direct roast, honest feedback, competitor reality check, survival tips, and a rewritten pitch.

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- TanStack Query

**Backend**
- Python + FastAPI
- Google Gemini AI (`gemini-2.5-flash`)
- Supabase (PostgreSQL)
- PyJWT + Google OAuth 2.0

---

## Project Structure

```
RoastMyStartup/
├── src/
│   ├── components/        # UI components and layout
│   ├── pages/             # Route-level page components
│   │   └── auth/          # Login, Signup, Callback, Continue
│   ├── lib/               # API client, auth utilities, navigation
│   └── hooks/             # Custom React hooks
├── backend/
│   ├── app/
│   │   ├── config/        # Settings and environment loading
│   │   ├── routes/        # Auth routes (Google OAuth)
│   │   ├── schemas/       # Pydantic request/response models
│   │   └── services/      # Gemini AI service, Supabase DB service
│   └── requirements.txt
└── public/
```

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## Local Setup

### Frontend

```bash
npm install
npm run dev
```

Runs on `http://localhost:8080` by default.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Then start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

All backend configuration is loaded from `backend/.env`. See `backend/.env.example` for the full template.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon/service key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes | OAuth callback URL (backend) |
| `JWT_SECRET_KEY` | Yes | Secret for signing JWT tokens (use `openssl rand -hex 32`) |
| `JWT_ALGORITHM` | No | JWT algorithm, default `HS256` |
| `JWT_EXPIRATION_HOURS` | No | Token TTL in hours, default `24` |
| `FRONTEND_BASE_URL` | No | Frontend origin for OAuth redirects, default `http://localhost:8080` |
| `DEBUG` | No | Debug mode, default `False` |

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an OAuth 2.0 Client ID (type: Web application).
2. Add the following to **Authorized redirect URIs**:
   - Local: `http://localhost:8000/auth/google/callback`
   - Production: `https://your-backend-url.onrender.com/auth/google/callback`
3. Copy the Client ID and Client Secret into your `.env`.

---

## Database Setup

Run the migration file against your Supabase project:

```bash
# Via Supabase dashboard SQL editor, or:
psql your_supabase_connection_string < backend/SUPABASE_MIGRATION.sql
```

This creates the `users`, `roasts`, and `login_events` tables.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/stats` | No | Aggregate roast statistics |
| `POST` | `/roast` | Optional | Generate a startup roast |
| `GET` | `/auth/google` | No | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | No | OAuth callback handler |

### POST /roast

**Request body:**
```json
{
  "startup_name": "string",
  "idea_description": "string",
  "target_users": "string",
  "budget": "string",
  "roast_level": "Soft" | "Medium" | "Nuclear"
}
```

**Response:**
```json
{
  "brutal_roast": "string",
  "honest_feedback": "string",
  "competitor_reality_check": "string",
  "survival_tips": ["string"],
  "pitch_rewrite": "string"
}
```

Pass a `Bearer` token in the `Authorization` header to link the roast to a user account. Anonymous requests are accepted but not persisted per user.

---

## Roast Levels

| Level | Description |
|---|---|
| Soft | Constructive, encouraging tone with light critique |
| Medium | Direct, VC-style feedback without sugarcoating |
| Nuclear | Ruthless, sarcastic takedown — no mercy |

---

## Deployment

The project is configured for deployment on [Render](https://render.com).

**Backend:** Deploy as a Python web service. Set all environment variables in the Render dashboard. The `GOOGLE_REDIRECT_URI` must point to your Render service URL.

**Frontend:** Deploy as a static site. Update `API_BASE_URL` in `src/lib/api.ts` to point to your deployed backend URL, or set it via a Vite environment variable.

---
