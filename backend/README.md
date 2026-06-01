# RoastMyStartup Backend

FastAPI backend powering **RoastMyStartup**.

Handles AI roast generation using Google Gemini, Google OAuth authentication, JWT-based authorization, rate limiting, and roast persistence through Supabase.

---

## Features

* AI-generated startup roasts using Gemini
* Multiple roast intensity levels (Soft, Medium, Nuclear)
* Google OAuth 2.0 authentication
* JWT-based session management
* Supabase PostgreSQL integration
* User roast history tracking
* Rate limiting with SlowAPI
* Automatic AI retry logic using Tenacity
* Swagger and ReDoc API documentation
* Modern Python dependency management with UV

---

## Tech Stack

| Category         | Technology            |
| ---------------- | --------------------- |
| Language         | Python 3.12+          |
| Package Manager  | UV                    |
| Framework        | FastAPI               |
| AI Model         | Gemini 2.5 Flash      |
| Database         | Supabase (PostgreSQL) |
| Authentication   | Google OAuth 2.0      |
| Token Management | PyJWT                 |
| Rate Limiting    | SlowAPI               |
| Retry Logic      | Tenacity              |

---

## Quick Commands

```bash
# Install dependencies
uv sync

# Start development server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest

# Lint code
uv run ruff check .

# Format code
uv run black .
```

---

## Project Structure

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── config/
│   │   └── settings.py
│   │
│   ├── routes/
│   │   └── auth.py
│   │
│   ├── schemas/
│   │   └── roast.py
│   │
│   └── services/
│       ├── roast_service.py
│       └── db_service.py
│
├── tests/
│   ├── test_api.py
│   ├── test_gemini.py
│   ├── test_hardened_service.py
│   └── test_supabase_integration.py
│
├── pyproject.toml
├── uv.lock
├── SUPABASE_MIGRATION.sql
└── .env.example
```

### Directory Overview

| Path                        | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `app/main.py`               | Application entry point, middleware, route registration |
| `config/settings.py`        | Environment configuration and settings                  |
| `routes/auth.py`            | Google OAuth endpoints                                  |
| `schemas/roast.py`          | Request and response models                             |
| `services/roast_service.py` | Gemini roast generation logic                           |
| `services/db_service.py`    | Supabase database operations                            |
| `tests/`                    | Unit and integration tests                              |
| `pyproject.toml`            | Project dependencies and configuration                  |
| `uv.lock`                   | Locked dependency versions                              |

---

## Getting Started

### 1. Install UV

If you don't already have UV installed:

**macOS / Linux**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify installation:

```bash
uv --version
```

---

### 2. Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

Fill in all required environment variables before starting the server.

---

### 3. Install Dependencies

UV automatically creates and manages the virtual environment.

```bash
uv sync
```

Install development dependencies:

```bash
uv sync --all-groups
```

---

### 4. Run Database Migration

Before launching the backend for the first time:

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Copy the contents of:

```text
SUPABASE_MIGRATION.sql
```

4. Execute the migration.

This creates:

* `users`
* `roasts`
* `login_events`

along with the required indexes and foreign key constraints.

---

### 5. Start the Development Server

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at:

```text
http://localhost:8000
```

---

## Available URLs

| URL                            | Description         |
| ------------------------------ | ------------------- |
| `http://localhost:8000`        | API root endpoint   |
| `http://localhost:8000/health` | Health check        |
| `http://localhost:8000/docs`   | Swagger UI          |
| `http://localhost:8000/redoc`  | ReDoc documentation |

---

## Environment Variables

| Variable               | Required | Description                                   |
| ---------------------- | -------- | --------------------------------------------- |
| `GEMINI_API_KEY`       | Yes      | Google Gemini API key                         |
| `SUPABASE_URL`         | Yes      | Supabase project URL                          |
| `SUPABASE_KEY`         | Yes      | Supabase anon or service key                  |
| `GOOGLE_CLIENT_ID`     | Yes      | Google OAuth client ID                        |
| `GOOGLE_CLIENT_SECRET` | Yes      | Google OAuth client secret                    |
| `GOOGLE_REDIRECT_URI`  | Yes      | Must match Google Cloud Console configuration |
| `JWT_SECRET_KEY`       | Yes      | Generate using `openssl rand -hex 32`         |
| `JWT_ALGORITHM`        | No       | Default: `HS256`                              |
| `JWT_EXPIRATION_HOURS` | No       | Default: `24`                                 |
| `FRONTEND_BASE_URL`    | No       | Frontend URL used after OAuth login           |
| `DEBUG`                | No       | Default: `False`                              |

---

## API Reference

### Public Endpoints

| Method | Endpoint                | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| `GET`  | `/health`               | Returns API, model, and database status   |
| `GET`  | `/stats`                | Returns aggregate roast statistics        |
| `GET`  | `/auth/google`          | Initiates Google OAuth login              |
| `GET`  | `/auth/google/callback` | Handles OAuth callback and JWT generation |

---

### Authenticated Endpoints

| Method | Endpoint       | Authentication        | Description           |
| ------ | -------------- | --------------------- | --------------------- |
| `POST` | `/roast`       | Optional Bearer Token | Generates a roast     |
| `GET`  | `/user/roasts` | Required Bearer Token | Returns roast history |

---

### POST /roast

#### Request Body

```json
{
  "startup_name": "string",
  "idea_description": "string",
  "target_users": "string",
  "budget": "string",
  "roast_level": "Soft"
}
```

Valid roast levels:

```text
Soft
Medium
Nuclear
```

---

#### Response

```json
{
  "brutal_roast": "string",
  "honest_feedback": "string",
  "competitor_reality_check": "string",
  "survival_tips": [
    "string"
  ],
  "pitch_rewrite": "string"
}
```

---

## Authentication Flow

```text
Frontend
   │
   ▼
GET /auth/google
   │
   ▼
Google OAuth Consent Screen
   │
   ▼
GET /auth/google/callback
   │
   ▼
Backend Exchanges Code
   │
   ▼
Fetch Google Profile
   │
   ▼
Upsert User in Supabase
   │
   ▼
Generate JWT
   │
   ▼
Redirect to Frontend
```

### Detailed Flow

1. Frontend redirects user to `GET /auth/google`
2. Backend redirects user to Google OAuth
3. User completes authentication
4. Google redirects back with authorization code
5. Backend exchanges code for access token
6. User profile is fetched from Google
7. User is created or updated in Supabase
8. JWT token is generated
9. Backend redirects to:

```text
{FRONTEND_BASE_URL}/auth/callback?token=<jwt>
```

10. Frontend stores JWT and sends:

```http
Authorization: Bearer <token>
```

on future requests.

---

## Roast Levels

| Level   | Description                                                |
| ------- | ---------------------------------------------------------- |
| Soft    | Constructive and encouraging feedback with light criticism |
| Medium  | Direct startup and VC-style analysis                       |
| Nuclear | Brutally honest, sarcastic, and ruthless feedback          |

---

## Rate Limiting

### IP-Based Limit

The `/roast` endpoint is limited to:

```text
10 requests per minute per IP address
```

Exceeding the limit returns:

```http
429 Too Many Requests
```

---

### Free Roast Limit

Authenticated users are limited to:

```text
6 free roasts
```

The limit is enforced server-side and validated against the database on every request.

---

## Testing

Run all tests:

```bash
uv run pytest
```

Run a specific test file:

```bash
uv run pytest tests/test_api.py
```

---

## API Documentation

Swagger UI:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```
