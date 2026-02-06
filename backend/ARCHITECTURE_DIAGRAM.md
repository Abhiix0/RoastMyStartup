# RoastMyStartup Backend Architecture

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE OAUTH LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                Backend                 Google              Supabase
       │                       │                       │                    │
       │  Click "Login"        │                       │                    │
       ├──────────────────────>│                       │                    │
       │                       │                       │                    │
       │  Redirect to Google   │                       │                    │
       │<──────────────────────┤                       │                    │
       │                       │                       │                    │
       │  OAuth Consent        │                       │                    │
       ├───────────────────────┼──────────────────────>│                    │
       │                       │                       │                    │
       │  Redirect with code   │                       │                    │
       │<──────────────────────┼───────────────────────┤                    │
       │                       │                       │                    │
       │  /auth/google/callback?code=xxx               │                    │
       ├──────────────────────>│                       │                    │
       │                       │                       │                    │
       │                       │  Exchange code        │                    │
       │                       ├──────────────────────>│                    │
       │                       │                       │                    │
       │                       │  Access token         │                    │
       │                       │<──────────────────────┤                    │
       │                       │                       │                    │
       │                       │  Get user profile     │                    │
       │                       ├──────────────────────>│                    │
       │                       │                       │                    │
       │                       │  {email, name, id}    │                    │
       │                       │<──────────────────────┤                    │
       │                       │                                            │
       │                       │  UPSERT user (email, name, google_id)      │
       │                       ├───────────────────────────────────────────>│
       │                       │                                            │
       │                       │  user_id                                   │
       │                       │<───────────────────────────────────────────┤
       │                       │                                            │
       │                       │  Create JWT(email, name)                   │
       │                       │  ─────────────────────                     │
       │                       │                                            │
       │  Redirect with JWT    │                                            │
       │<──────────────────────┤                                            │
       │                       │                                            │
       │  Store JWT in         │                                            │
       │  localStorage         │                                            │
       │  ─────────────        │                                            │
       │                       │                                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                         ROAST GENERATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                Backend                 Gemini AI          Supabase
       │                       │                       │                    │
       │  POST /roast          │                       │                    │
       │  Authorization:       │                       │                    │
       │  Bearer <JWT>         │                       │                    │
       ├──────────────────────>│                       │                    │
       │                       │                       │                    │
       │                       │  Decode JWT           │                    │
       │                       │  Extract email        │                    │
       │                       │  ─────────────        │                    │
       │                       │                       │                    │
       │                       │  Generate roast       │                    │
       │                       ├──────────────────────>│                    │
       │                       │                       │                    │
       │                       │  Roast response       │                    │
       │                       │<──────────────────────┤                    │
       │                       │                                            │
       │                       │  SELECT * FROM users WHERE email = ?       │
       │                       ├───────────────────────────────────────────>│
       │                       │                                            │
       │                       │  {id: user_id, email, name}                │
       │                       │<───────────────────────────────────────────┤
       │                       │                                            │
       │                       │  INSERT INTO roasts (user_id, ...)         │
       │                       ├───────────────────────────────────────────>│
       │                       │                                            │
       │                       │  {id: roast_id, ...}                       │
       │                       │<───────────────────────────────────────────┤
       │                       │                                            │
       │  Roast response       │                                            │
       │<──────────────────────┤                                            │
       │                       │                                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                    ANONYMOUS ROAST FLOW (NO LOGIN)                       │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                Backend                 Gemini AI          Supabase
       │                       │                       │                    │
       │  POST /roast          │                       │                    │
       │  (no Authorization)   │                       │                    │
       ├──────────────────────>│                       │                    │
       │                       │                       │                    │
       │                       │  No JWT found         │                    │
       │                       │  user_email = None    │                    │
       │                       │  ─────────────────    │                    │
       │                       │                       │                    │
       │                       │  Generate roast       │                    │
       │                       ├──────────────────────>│                    │
       │                       │                       │                    │
       │                       │  Roast response       │                    │
       │                       │<──────────────────────┤                    │
       │                       │                                            │
       │                       │  INSERT INTO roasts (user_id=NULL, ...)    │
       │                       ├───────────────────────────────────────────>│
       │                       │                                            │
       │                       │  {id: roast_id, ...}                       │
       │                       │<───────────────────────────────────────────┤
       │                       │                                            │
       │  Roast response       │                                            │
       │<──────────────────────┤                                            │
       │                       │                                            │
```

## Database Schema Relationships

```
┌─────────────────────────┐
│        users            │
├─────────────────────────┤
│ id (PK)          UUID   │◄─────┐
│ email (UNIQUE)   TEXT   │      │
│ name             TEXT   │      │
│ google_id        TEXT   │      │
│ last_login       TS     │      │
│ created_at       TS     │      │
└─────────────────────────┘      │
                                 │
                                 │ Foreign Key
                                 │ (ON DELETE SET NULL)
                                 │
┌─────────────────────────┐      │
│        roasts           │      │
├─────────────────────────┤      │
│ id (PK)          UUID   │      │
│ user_id (FK)     UUID   │──────┘
│ startup_name     TEXT   │
│ idea_description TEXT   │
│ target_users     TEXT   │
│ budget           TEXT   │
│ roast_level      TEXT   │
│ brutal_roast     TEXT   │
│ honest_feedback  TEXT   │
│ competitor_...   TEXT   │
│ survival_tips    JSONB  │
│ pitch_rewrite    TEXT   │
│ created_at       TS     │
└─────────────────────────┘
```

## Key Backend Components

```
┌──────────────────────────────────────────────────────────────┐
│                      app/routes/auth.py                       │
├──────────────────────────────────────────────────────────────┤
│  /auth/google          - Initiates OAuth flow                │
│  /auth/google/callback - Handles OAuth callback              │
│                        - Fetches user profile                │
│                        - ✨ UPSERTS user to DB               │
│                        - Creates JWT token                   │
└──────────────────────────────────────────────────────────────┘
                                │
                                │ calls
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                  app/services/db_service.py                   │
├──────────────────────────────────────────────────────────────┤
│  upsert_user()         - ✨ Create/update user in DB         │
│  get_user_by_email()   - ✨ Lookup user by email             │
│  save_roast()          - ✨ Save roast with user_id          │
│  get_roast_stats()     - Get statistics                      │
│  health_check()        - Test DB connection                  │
└──────────────────────────────────────────────────────────────┘
                                ▲
                                │ calls
                                │
┌──────────────────────────────────────────────────────────────┐
│                       app/main.py                             │
├──────────────────────────────────────────────────────────────┤
│  POST /roast           - ✨ Extracts JWT from header         │
│                        - ✨ Decodes email from JWT           │
│                        - Generates roast with Gemini         │
│                        - ✨ Saves with user linkage          │
└──────────────────────────────────────────────────────────────┘
                                │
                                │ calls
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                 app/services/roast_service.py                 │
├──────────────────────────────────────────────────────────────┤
│  analyze_startup()     - Generates roast with Gemini AI      │
│  (unchanged)           - Handles retries and errors          │
└──────────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    FAIL-SAFE DESIGN                          │
└─────────────────────────────────────────────────────────────┘

User Login:
  ├─ OAuth fails → Redirect to frontend with error
  ├─ DB upsert fails → Log error, continue (JWT still created)
  └─ JWT creation fails → Redirect to frontend with error

Roast Generation:
  ├─ JWT decode fails → Continue as anonymous user
  ├─ JWT expired → Continue as anonymous user
  ├─ User lookup fails → Save roast with user_id=NULL
  ├─ Gemini AI fails → Retry once, then return HTTP 500
  └─ DB save fails → Log error, still return roast to user

PRINCIPLE: User experience > data persistence
           Always return the roast, even if DB fails
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                         │
└─────────────────────────────────────────────────────────────┘

1. OAuth Security
   ├─ Google handles authentication
   ├─ Backend never sees user password
   └─ Access tokens are short-lived

2. JWT Security
   ├─ Signed with secret key (HS256)
   ├─ Contains only email + name (no sensitive data)
   ├─ Expires after 24 hours
   └─ Validated on every request

3. Database Security
   ├─ Supabase client uses API key (not direct DB access)
   ├─ Email uniqueness enforced at DB level
   ├─ Foreign key constraints prevent orphaned data
   └─ Parameterized queries (no SQL injection)

4. CORS Security
   ├─ Only allows specific frontend origins
   ├─ Credentials allowed for authenticated requests
   └─ Configurable per environment
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                       │
└─────────────────────────────────────────────────────────────┘

OAuth Login Flow:
  ├─ Google OAuth: ~500-1000ms
  ├─ User upsert: ~10-50ms
  ├─ JWT creation: <1ms
  └─ Total: ~500-1050ms

Roast Generation (Authenticated):
  ├─ JWT decode: <1ms
  ├─ Gemini AI: ~2000-5000ms (dominant factor)
  ├─ User lookup: ~10-50ms
  ├─ DB save: ~10-50ms
  └─ Total: ~2020-5100ms

Roast Generation (Anonymous):
  ├─ Gemini AI: ~2000-5000ms
  ├─ DB save: ~10-50ms
  └─ Total: ~2010-5050ms

Note: DB operations are non-blocking and don't delay response
```
