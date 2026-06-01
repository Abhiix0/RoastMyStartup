# RoastMyStartup

Brutally honest AI feedback on startup ideas. Submit your idea, pick a roast intensity, and receive analysis across five dimensions: a direct roast, honest feedback, competitor reality check, survival tips, and a rewritten pitch.

---

## Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query

**Backend** — Python, FastAPI, Google Gemini (`gemini-2.5-flash`), Supabase (PostgreSQL), PyJWT, slowapi

---

## Repository Structure
RoastMyStartup/
├── src/
│   ├── components/        # UI components and layout
│   ├── pages/             # Route-level page components
│   │   └── auth/          # Login, Signup, Callback, Continue
│   ├── lib/               # API client, auth utilities, navigation helpers
│   └── hooks/             # Custom React hooks
├── backend/
│   ├── app/
│   │   ├── config/        # Settings and environment loading
│   │   ├── routes/        # Auth routes (Google OAuth)
│   │   ├── schemas/       # Pydantic request and response models
│   │   └── services/      # Gemini AI service, Supabase DB service
│   ├── requirements.txt
│   └── .env.example
└── public/
---

## Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project with the migration applied (see `backend/SUPABASE_MIGRATION.sql`)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## Frontend Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:8080`.

---

## Backend Setup

See `backend/README.md` for full backend setup instructions.

---

## Environment Variables

All backend configuration lives in `backend/.env`. Copy the example file to get started:

```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon or service key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes | OAuth callback URL pointing to the backend |
| `JWT_SECRET_KEY` | Yes | Secret for signing JWT tokens — generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | No | Default: `HS256` |
| `JWT_EXPIRATION_HOURS` | No | Default: `24` |
| `FRONTEND_BASE_URL` | No | Frontend origin for OAuth redirects. Default: `http://localhost:8080` |
| `DEBUG` | No | Default: `False` |

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an OAuth 2.0 Client ID (type: Web application).
2. Add to **Authorized redirect URIs**:
   - Local: `http://localhost:8000/auth/google/callback`
   - Production: `https://your-backend-url.onrender.com/auth/google/callback`
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `backend/.env`.

---

## Database Setup

Run the migration against your Supabase project before starting the backend for the first time:

```bash
# Via the Supabase dashboard SQL editor, paste and run:
backend/SUPABASE_MIGRATION.sql
```

This creates the `users`, `roasts`, and `login_events` tables with the correct schema and indexes.

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check — returns `{ status: "alive" }` |
| `GET` | `/stats` | No | Aggregate roast statistics |
| `POST` | `/roast` | Optional | Generate a startup roast (rate limited: 10/min per IP) |
| `GET` | `/user/roasts` | Required | Fetch the authenticated user's roast history |
| `GET` | `/auth/google` | No | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | No | OAuth callback — issues JWT and redirects to frontend |

Pass a JWT as `Authorization: Bearer <token>` on `/roast` to link the roast to a user account. Anonymous requests are accepted but not tracked per user. Authenticated users are limited to 6 free roasts, enforced server-side.

---

## Roast Levels

| Level | Behavior |
|---|---|
| Soft | Constructive, encouraging tone with light critique |
| Medium | Direct, VC-style feedback without sugarcoating |
| Nuclear | Ruthless, sarcastic — no mercy |

---

## License

MIT