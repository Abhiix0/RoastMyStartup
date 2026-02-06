# Supabase Auth + Database Integration Guide

## Overview
This document explains how user authentication and roast persistence work together in the RoastMyStartup backend.

## Architecture Flow

### 1. User Login Flow (OAuth → Database)

```
User clicks "Login with Google"
    ↓
Frontend redirects to: /auth/google
    ↓
Backend redirects to: Google OAuth consent screen
    ↓
User grants permission
    ↓
Google redirects to: /auth/google/callback?code=xxx
    ↓
Backend exchanges code for access token
    ↓
Backend fetches user profile (email, name, google_id)
    ↓
Backend UPSERTS user to `users` table ← NEW
    ↓
Backend generates JWT token (contains email)
    ↓
Backend redirects to frontend with JWT
    ↓
Frontend stores JWT in localStorage
```

**Key Implementation:**
- `auth.py:google_callback()` calls `db_service.upsert_user()`
- Uses UPSERT to handle both new and returning users
- Email is the unique constraint (no duplicate users)
- Updates `last_login` timestamp on every login

### 2. Roast Generation Flow (JWT → User Linkage)

```
User submits roast form
    ↓
Frontend sends POST /roast with:
    - Request body: startup details
    - Authorization header: "Bearer <JWT>"
    ↓
Backend extracts email from JWT
    ↓
Backend generates roast with Gemini AI
    ↓
Backend looks up user_id by email
    ↓
Backend saves roast with user_id foreign key ← NEW
    ↓
Backend returns roast to user
```

**Key Implementation:**
- `main.py:roast_startup()` extracts JWT from Authorization header
- Decodes JWT to get user email
- Passes email to `db_service.save_roast()`
- `save_roast()` looks up user_id and links the roast
- If user not found or not logged in → saves as anonymous (user_id = NULL)

## Database Schema Requirements

### `users` table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    google_id TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### `roasts` table
```sql
CREATE TABLE roasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Can be NULL for anonymous
    startup_name TEXT NOT NULL,
    idea_description TEXT NOT NULL,
    target_users TEXT,
    budget TEXT,
    roast_level TEXT,
    brutal_roast TEXT,
    honest_feedback TEXT,
    competitor_reality_check TEXT,
    survival_tips JSONB,
    pitch_rewrite TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Critical Points:**
- `users.email` must be UNIQUE (prevents duplicate users)
- `roasts.user_id` is NULLABLE (allows anonymous roasts)
- Foreign key uses `ON DELETE SET NULL` (preserves roasts if user deleted)

## Common Mistakes & Solutions

### ❌ Mistake 1: Duplicate Users
**Problem:** Creating new user row on every login
**Solution:** Use UPSERT with `on_conflict="email"`
```python
self.supabase.table("users").upsert(user_data, on_conflict="email").execute()
```

### ❌ Mistake 2: Missing user_id in Roasts
**Problem:** Saving roasts without linking to user
**Solution:** Always look up user_id before inserting roast
```python
user = self.get_user_by_email(user_email)
user_id = user.get("id") if user else None
roast_data["user_id"] = user_id
```

### ❌ Mistake 3: Race Condition
**Problem:** Roast saved before user record exists
**Solution:** User is created during OAuth callback (before JWT issued), so user always exists when roast is saved

### ❌ Mistake 4: Blocking on DB Failures
**Problem:** User doesn't get roast if database fails
**Solution:** Wrap DB operations in try/except, log errors but don't raise
```python
try:
    db_service.save_roast(...)
except Exception as e:
    logger.error(f"DB error: {e}")
    # User still gets their roast response
```

### ❌ Mistake 5: JWT Not Sent from Frontend
**Problem:** Frontend doesn't include Authorization header
**Solution:** Frontend must send JWT in every authenticated request:
```javascript
fetch('/roast', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
```

## Testing Checklist

### User Persistence
- [ ] New user login creates row in `users` table
- [ ] Returning user login updates `last_login` timestamp
- [ ] No duplicate users created (email uniqueness enforced)
- [ ] User record includes: email, name, google_id, last_login

### Roast Linkage
- [ ] Logged-in user's roast has correct `user_id`
- [ ] Anonymous user's roast has `user_id = NULL`
- [ ] Expired JWT doesn't break roast generation
- [ ] Invalid JWT doesn't break roast generation
- [ ] Missing Authorization header doesn't break roast generation

### Error Handling
- [ ] Database failure doesn't prevent roast generation
- [ ] User still gets roast even if save fails
- [ ] Errors are logged but not exposed to user
- [ ] OAuth failure redirects to frontend with error message

## Monitoring & Debugging

### Key Log Messages
```
✅ User {email} upserted successfully with ID: {user_id}
✅ Linking roast to user_id: {user_id} ({email})
✅ Successfully saved roast for {startup_name} to database
⚠️ User {email} not found in database - saving as anonymous roast
❌ Failed to persist user {email} to database: {error}
```

### Database Queries for Verification
```sql
-- Check user was created
SELECT * FROM users WHERE email = 'user@example.com';

-- Check roast is linked to user
SELECT r.*, u.email 
FROM roasts r 
LEFT JOIN users u ON r.user_id = u.id 
WHERE r.startup_name = 'MyStartup';

-- Count roasts per user
SELECT u.email, COUNT(r.id) as roast_count
FROM users u
LEFT JOIN roasts r ON u.id = r.user_id
GROUP BY u.email;
```

## Frontend Integration

### Storing JWT
```javascript
// After OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('jwt_token', token);
}
```

### Sending JWT with Roast Request
```javascript
const token = localStorage.getItem('jwt_token');
const response = await fetch('http://localhost:8000/roast', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(roastRequest)
});
```

## Security Considerations

1. **JWT Secret:** Must be strong and kept secret (use environment variable)
2. **Token Expiration:** JWT expires after 24 hours (configurable)
3. **HTTPS Only:** In production, use HTTPS for all OAuth and API calls
4. **CORS:** Only allow trusted frontend origins
5. **SQL Injection:** Supabase client handles parameterization automatically
6. **PII Protection:** User email is sensitive - log carefully

## Performance Notes

- User upsert is fast (single query with conflict resolution)
- User lookup for roast linkage adds ~10ms per roast
- Database operations are non-blocking (don't delay roast response)
- Failed DB writes are logged but don't impact user experience
