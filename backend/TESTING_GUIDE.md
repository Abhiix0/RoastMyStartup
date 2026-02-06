# Testing Guide - Supabase Integration

## Quick Verification Steps

### 1. Verify Backend Changes Applied

```bash
cd backend

# Check that imports are correct
grep "from app.services.db_service import db_service" app/routes/auth.py
grep "import jwt" app/main.py

# Check that methods exist
grep "def upsert_user" app/services/db_service.py
grep "def get_user_by_email" app/services/db_service.py
```

### 2. Start Backend Server

```bash
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Starting RoastMyStartup API
INFO:     Using Gemini model: gemini-2.5-flash
INFO:     ✅ Gemini API key configured successfully
INFO:     ✅ Supabase database connection healthy
```

### 3. Test User Login Flow

#### Step 1: Initiate OAuth
```bash
# Open in browser
http://localhost:8000/auth/google
```

Expected: Redirects to Google OAuth consent screen

#### Step 2: Complete OAuth
- Select your Google account
- Grant permissions
- Should redirect to frontend with JWT token

#### Step 3: Verify User in Supabase
```sql
-- In Supabase SQL Editor
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```

Expected result:
```
id                  | email              | name          | google_id | last_login          | created_at
--------------------|--------------------|--------------|-----------|--------------------|--------------------
uuid-here           | you@gmail.com      | Your Name    | 123456    | 2024-01-15 10:30   | 2024-01-15 10:30
```

#### Step 4: Test Returning User (No Duplicate)
- Logout and login again with same Google account
- Check Supabase users table
- Should see `last_login` updated, but no new row created

### 4. Test Roast Generation (Authenticated)

#### Step 1: Get JWT Token
After OAuth login, extract token from URL:
```
http://localhost:8080/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 2: Send Roast Request with JWT
```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "startup_name": "TestStartup",
    "idea_description": "An AI-powered app that does something revolutionary",
    "target_users": "Tech-savvy millennials",
    "budget": "$10k",
    "roast_level": "Medium"
  }'
```

#### Step 3: Check Backend Logs
Expected log messages:
```
INFO: Processing roast request for: TestStartup
INFO: Authenticated user: you@gmail.com
INFO: Successfully generated roast for: TestStartup
INFO: Linking roast to user_id: uuid-here (you@gmail.com)
INFO: ✅ Roast for TestStartup saved to database
```

#### Step 4: Verify Roast in Supabase
```sql
-- In Supabase SQL Editor
SELECT 
    r.id,
    r.startup_name,
    r.user_id,
    u.email,
    u.name
FROM roasts r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 1;
```

Expected result:
```
id          | startup_name  | user_id     | email           | name
------------|---------------|-------------|-----------------|------------
uuid-here   | TestStartup   | uuid-here   | you@gmail.com   | Your Name
```

✅ **Success:** `user_id` is populated and matches your user record!

### 5. Test Roast Generation (Anonymous)

#### Step 1: Send Roast Request WITHOUT JWT
```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -d '{
    "startup_name": "AnonymousStartup",
    "idea_description": "Another revolutionary idea",
    "target_users": "Everyone",
    "budget": "$5k",
    "roast_level": "Soft"
  }'
```

#### Step 2: Check Backend Logs
Expected log messages:
```
INFO: Processing roast request for: AnonymousStartup
INFO: Successfully generated roast for: AnonymousStartup
INFO: ✅ Roast for AnonymousStartup saved to database
```

Note: No "Authenticated user" or "Linking roast to user_id" messages

#### Step 3: Verify Anonymous Roast in Supabase
```sql
SELECT 
    r.id,
    r.startup_name,
    r.user_id,
    r.created_at
FROM roasts r
WHERE r.startup_name = 'AnonymousStartup';
```

Expected result:
```
id          | startup_name       | user_id | created_at
------------|--------------------|---------|-----------------
uuid-here   | AnonymousStartup   | NULL    | 2024-01-15 10:35
```

✅ **Success:** `user_id` is NULL for anonymous roasts!

### 6. Test Error Handling

#### Test 1: Expired JWT
```bash
# Use an old/expired token
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EXPIRED_TOKEN_HERE" \
  -d '{
    "startup_name": "ExpiredTokenTest",
    "idea_description": "Testing expired token handling",
    "target_users": "Testers",
    "budget": "$1k",
    "roast_level": "Soft"
  }'
```

Expected:
- Request succeeds (returns roast)
- Backend logs: "JWT token expired - proceeding as anonymous user"
- Roast saved with `user_id = NULL`

#### Test 2: Invalid JWT
```bash
# Use a malformed token
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -d '{
    "startup_name": "InvalidTokenTest",
    "idea_description": "Testing invalid token handling",
    "target_users": "Testers",
    "budget": "$1k",
    "roast_level": "Soft"
  }'
```

Expected:
- Request succeeds (returns roast)
- Backend logs: "Invalid JWT token - proceeding as anonymous user"
- Roast saved with `user_id = NULL`

### 7. Verify Database Relationships

```sql
-- Count roasts per user
SELECT 
    u.email,
    u.name,
    COUNT(r.id) as roast_count
FROM users u
LEFT JOIN roasts r ON u.id = r.user_id
GROUP BY u.id, u.email, u.name
ORDER BY roast_count DESC;
```

Expected result:
```
email              | name          | roast_count
-------------------|---------------|-------------
you@gmail.com      | Your Name     | 3
other@gmail.com    | Other User    | 1
```

```sql
-- Count anonymous roasts
SELECT COUNT(*) as anonymous_roasts
FROM roasts
WHERE user_id IS NULL;
```

Expected result:
```
anonymous_roasts
-----------------
2
```

## Common Issues & Solutions

### Issue 1: "User not found in database - saving as anonymous roast"

**Cause:** User logged in but wasn't saved to database during OAuth

**Solution:**
1. Check OAuth callback logs for DB errors
2. Verify Supabase connection is healthy
3. Check `users` table has correct schema
4. Try logging in again

### Issue 2: All roasts have user_id = NULL

**Cause:** Frontend not sending JWT token in Authorization header

**Solution:**
1. Check frontend localStorage has JWT token
2. Verify frontend sends `Authorization: Bearer <token>` header
3. Check CORS settings allow Authorization header
4. Test with curl to isolate frontend vs backend issue

### Issue 3: Duplicate users created on each login

**Cause:** `users` table missing UNIQUE constraint on email

**Solution:**
```sql
-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

### Issue 4: Foreign key constraint violation

**Cause:** Trying to insert roast with non-existent user_id

**Solution:**
- This shouldn't happen with current implementation
- Check `get_user_by_email()` is working correctly
- Verify user exists before saving roast

## Health Check Endpoints

```bash
# Check backend is running
curl http://localhost:8000/health

# Expected response:
{
  "status": "alive",
  "model": "gemini-2.5-flash",
  "database": "healthy"
}

# Check roast statistics
curl http://localhost:8000/stats

# Expected response:
{
  "total_roasts": 15,
  "roast_levels": {
    "Soft": 5,
    "Medium": 7,
    "Nuclear": 3
  },
  "last_updated": "2024-01-15T10:30:00"
}
```

## Frontend Integration Checklist

- [ ] Frontend stores JWT after OAuth callback
- [ ] Frontend sends JWT in Authorization header for roast requests
- [ ] Frontend handles 401 Unauthorized (expired token)
- [ ] Frontend allows anonymous roasts (no token required)
- [ ] Frontend shows user email/name when logged in
- [ ] Frontend has logout functionality (clears JWT)

## Success Criteria

✅ **User Persistence:**
- New user login creates row in `users` table
- Returning user login updates `last_login`
- No duplicate users (email uniqueness enforced)

✅ **Roast Linkage:**
- Authenticated roasts have `user_id` populated
- Anonymous roasts have `user_id = NULL`
- Foreign key relationship works correctly

✅ **Error Handling:**
- Expired/invalid JWT doesn't break roast generation
- DB failures don't prevent roast response
- All errors logged but not exposed to user

✅ **Performance:**
- User upsert adds <50ms to login flow
- User lookup adds <50ms to roast generation
- DB operations don't block roast response
