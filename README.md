# RoastMyStartup

**Brutally honest AI feedback for startup ideas.**

Submit your startup idea, choose a roast intensity, and get AI-powered feedback across five dimensions:

* 🔥 Brutal Roast
* 🎯 Honest Feedback
* 🥊 Competitor Reality Check
* 🚀 Survival Tips
* ✍️ Pitch Rewrite

Whether you're validating a side project or preparing for investors, RoastMyStartup helps uncover weaknesses before the real world does.

---

## Features

* AI-powered startup analysis using Gemini
* Three roast intensity levels
* Google OAuth authentication
* Personalized roast history
* Competitor reality checks
* Actionable survival recommendations
* AI-generated pitch rewrites
* Rate-limited backend protection
* Supabase-powered persistence

---

## Tech Stack

### Frontend

| Technology      | Purpose                 |
| --------------- | ----------------------- |
| React 18        | UI Framework            |
| TypeScript      | Type Safety             |
| Vite            | Build Tool              |
| Tailwind CSS    | Styling                 |
| React Router v6 | Routing                 |
| TanStack Query  | Server State Management |

### Backend

| Technology          | Purpose             |
| ------------------- | ------------------- |
| FastAPI             | Backend Framework   |
| Gemini 2.5 Flash    | AI Roast Generation |
| Supabase PostgreSQL | Database            |
| Google OAuth 2.0    | Authentication      |
| PyJWT               | JWT Management      |
| SlowAPI             | Rate Limiting       |

---

## Repository Structure

```text
RoastMyStartup/
│
├── src/
│   ├── components/
│   │   └── UI components and layouts
│   │
│   ├── pages/
│   │   ├── Route-level pages
│   │   └── auth/
│   │       ├── Login
│   │       ├── Signup
│   │       ├── Callback
│   │       └── Continue
│   │
│   ├── hooks/
│   │   └── Custom React hooks
│   │
│   └── lib/
│       ├── API client
│       ├── Auth utilities
│       └── Navigation helpers
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── SUPABASE_MIGRATION.sql
│
└── public/
```

---

## Prerequisites

Before running the project, make sure you have:

* Node.js 18+
* Python 3.11+
* A Supabase project
* A Google Gemini API key
* Google OAuth credentials

Required services:

* Supabase
* Google AI Studio
* Google Cloud Console

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RoastMyStartup
```

---

### 2. Install Frontend Dependencies

```bash
npm install
```

---

### 3. Configure Backend

Create a backend environment file:

```bash
cp backend/.env.example backend/.env
```

Fill in all required environment variables.

---

### 4. Run Database Migration

Open your Supabase project and execute:

```text
backend/SUPABASE_MIGRATION.sql
```

This creates:

* users
* roasts
* login_events

along with the required indexes and relationships.

---

### 5. Start the Frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:8080
```

---

### 6. Start the Backend

See:

```text
backend/README.md
```

for complete backend setup instructions.

---

## Environment Variables

All backend configuration is stored in:

```text
backend/.env
```

Create it using:

```bash
cp backend/.env.example backend/.env
```

### Required Variables

| Variable               | Required | Description                    |
| ---------------------- | -------- | ------------------------------ |
| `GEMINI_API_KEY`       | Yes      | Gemini API key                 |
| `SUPABASE_URL`         | Yes      | Supabase project URL           |
| `SUPABASE_KEY`         | Yes      | Supabase API key               |
| `GOOGLE_CLIENT_ID`     | Yes      | OAuth client ID                |
| `GOOGLE_CLIENT_SECRET` | Yes      | OAuth client secret            |
| `GOOGLE_REDIRECT_URI`  | Yes      | Backend OAuth callback URL     |
| `JWT_SECRET_KEY`       | Yes      | Secret used to sign JWT tokens |
| `JWT_ALGORITHM`        | No       | Default: `HS256`               |
| `JWT_EXPIRATION_HOURS` | No       | Default: `24`                  |
| `FRONTEND_BASE_URL`    | No       | Frontend URL                   |
| `DEBUG`                | No       | Default: `False`               |

---

## Google OAuth Setup

### Create OAuth Credentials

1. Open Google Cloud Console.
2. Navigate to **APIs & Services → Credentials**.
3. Create an **OAuth 2.0 Client ID**.
4. Choose **Web Application**.

---

### Authorized Redirect URIs

#### Local Development

```text
http://localhost:8000/auth/google/callback
```

#### Production

```text
https://your-backend-url.onrender.com/auth/google/callback
```

---

### Configure Environment Variables

Add the following values to `backend/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

---

## Database Setup

Before running the backend for the first time:

1. Open the Supabase Dashboard.
2. Navigate to the SQL Editor.
3. Copy the contents of:

```text
backend/SUPABASE_MIGRATION.sql
```

4. Execute the migration.

This creates the required database schema, indexes, and relationships.

---

## API Overview

| Method | Endpoint                | Auth     | Description            |
| ------ | ----------------------- | -------- | ---------------------- |
| `GET`  | `/health`               | No       | Health check           |
| `GET`  | `/stats`                | No       | Roast statistics       |
| `POST` | `/roast`                | Optional | Generate startup roast |
| `GET`  | `/user/roasts`          | Required | User roast history     |
| `GET`  | `/auth/google`          | No       | Start OAuth flow       |
| `GET`  | `/auth/google/callback` | No       | OAuth callback         |

---

### Authentication

Authenticated requests should include:

```http
Authorization: Bearer <token>
```

Authenticated users receive:

* Roast history tracking
* Account persistence
* Free roast allocation enforcement

Anonymous users can still generate roasts but are not linked to an account.

---

## Roast Levels

| Level   | Description                                  |
| ------- | -------------------------------------------- |
| Soft    | Constructive feedback with gentle criticism  |
| Medium  | Direct startup-focused analysis              |
| Nuclear | Brutal, sarcastic, and completely unfiltered |

---

## Project Architecture

```text
Frontend (React)
        │
        ▼
FastAPI Backend
        │
 ┌──────┴──────┐
 ▼             ▼
Gemini      Supabase
 AI        PostgreSQL
```

---

## Development Notes

### Frontend

```bash
npm run dev
```

### Backend

Refer to:

```text
backend/README.md
```

for:

* FastAPI setup
* OAuth configuration
* Database migration
* API documentation
* Testing

---

## License

MIT License

Feel free to fork, modify, and build upon the project.
