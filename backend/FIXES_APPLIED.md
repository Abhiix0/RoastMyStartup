# ✅ Backend Fixes Applied

## Changes Summary

### File 1: `backend/app/services/db_service.py`

**Changed:**
- `upsert_user()` signature: Added `provider_id` (required), `picture` (optional), `provider` parameters
- `upsert_user()` logic: Uses `on_conflict="provider_id,provider"` instead of `"email"`
- `upsert_user()` data: Sends `provider_id`, `picture`, `provider` to match schema

**Added:**
- `log_login_event()` method: Logs every login to `login_events` table

**Changed:**
- `save_roast()` signature: Changed `user_email` parameter to `user_id`
- `save_roast()` logic: Removed email lookup, uses `user_id` directly

**Removed:**
- Email-based user lookup logic in `save_roast()`

---

### File 2: `backend/app/routes/auth.py`

**Changed:**
- `create_jwt_token()` signature: Added `user_id`, `provider` parameters
- `create_jwt_token()` payload: Now includes `user_id` and `provider` fields

**Changed:**
- `google_callback()` signature: Added `request: Request` parameter for IP/user-agent
- `google_callback()` logic: Extracts `provider_id` and `picture` from Google user_info
- `google_callback()` validation: Requires both `email` and `provider_id`
- `google_callback()` upsert call: Passes `provider_id`, `picture`, `provider="google"`

**Added:**
- `db_service.log_login_event()` call after successful user upsert
- IP address and user-agent extraction from request

---

### File 3: `backend/app/main.py`

**Changed:**
- `roast_startup()` JWT extraction: Gets `user_id` from payload instead of `email`
- `roast_startup()` logging: Logs `user_id` instead of `email`
- `roast_startup()` save call: Passes `user_id` directly to `save_roast()`

---

## ✅ Requirements Satisfied

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Users upserted using (provider_id, provider) | ✅ | `on_conflict="provider_id,provider"` |
| login_events written on every OAuth login | ✅ | `log_login_event()` called in callback |
| JWT contains user_id (UUID) | ✅ | Payload includes `user_id` field |
| Roasts saved with user_id if authenticated | ✅ | `save_roast(user_id=user_id)` |
| Roasts saved with NULL if anonymous | ✅ | `user_id=None` when no JWT |
| No user lookup by email | ✅ | Removed email lookup logic |
| Google OAuth only | ✅ | `provider="google"` hardcoded |
| Service role key access | ✅ | No changes to Supabase client |
| Anonymous roasts still work | ✅ | `user_id` is optional parameter |
| No frontend changes needed | ✅ | JWT structure change is backward compatible |

---

## 🧪 5-Step Smoke Test

### Step 1: Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Starting RoastMyStartup API
INFO:     ✅ Gemini API key configured successfully
INFO:     ✅ Supabase database connection healthy
```

---

### Step 2: Test OAuth Login
```bash
# Open in browser
http://localhost:8000/auth/google
```

**Actions:**
1. Complete Google OAuth flow
2. Get redirected to frontend with JWT token

**Verify in Supabase:**
```sql
-- Check user was created with provider_id
SELECT id, provider_id, email, name, picture, provider, last_login 
FROM users 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected: New row with `provider_id` populated (Google's user ID)

```sql
-- Check login event was logged
SELECT user_id, provider, success, timestamp, ip_address, user_agent 
FROM login_events 
ORDER BY timestamp DESC 
LIMIT 1;
```

Expected: New row with matching `user_id` from users table

---

### Step 3: Decode JWT Token
```bash
# Extract token from URL: http://localhost:8080/auth/callback?token=eyJ...

# Decode at https://jwt.io or use:
echo "YOUR_TOKEN_HERE" | cut -d'.' -f2 | base64 -d | jq
```

Expected payload:
```json
{
  "user_id": "uuid-here",
  "email": "you@gmail.com",
  "name": "Your Name",
  "provider": "google",
  "exp": 1234567890
}
```

✅ Verify `user_id` field exists and is a UUID

---

### Step 4: Test Authenticated Roast
```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "startup_name": "AuthTest",
    "idea_description": "Testing authenticated roast",
    "target_users": "Developers",
    "budget": "$5k",
    "roast_level": "Soft"
  }'
```

**Check backend logs:**
```
INFO: Processing roast request for: AuthTest
INFO: Authenticated user_id: uuid-here
INFO: Successfully generated roast for: AuthTest
INFO: ✅ Roast for AuthTest saved to database
```

**Verify in Supabase:**
```sql
SELECT r.id, r.startup_name, r.user_id, u.email 
FROM roasts r
JOIN users u ON r.user_id = u.id
WHERE r.startup_name = 'AuthTest';
```

Expected: `user_id` matches your user UUID

---

### Step 5: Test Anonymous Roast
```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -d '{
    "startup_name": "AnonTest",
    "idea_description": "Testing anonymous roast",
    "target_users": "Everyone",
    "budget": "$1k",
    "roast_level": "Medium"
  }'
```

**Check backend logs:**
```
INFO: Processing roast request for: AnonTest
INFO: Successfully generated roast for: AnonTest
INFO: ✅ Roast for AnonTest saved to database
```

Note: No "Authenticated user_id" message

**Verify in Supabase:**
```sql
SELECT id, startup_name, user_id 
FROM roasts 
WHERE startup_name = 'AnonTest';
```

Expected: `user_id` is `NULL`

---

## 🎯 Success Criteria

✅ **User Creation:**
- User row has `provider_id` (Google's ID)
- User row has `provider = 'google'`
- User row has `picture` URL
- No duplicate users on re-login

✅ **Login Tracking:**
- `login_events` row created on every login
- `user_id` in login_events matches users table
- `user_id` is UUID type (not TEXT)

✅ **JWT Structure:**
- JWT contains `user_id` field
- JWT contains `provider` field
- `user_id` is a valid UUID

✅ **Roast Linkage:**
- Authenticated roasts have `user_id` populated
- Anonymous roasts have `user_id = NULL`
- No email lookups in logs

✅ **Error Handling:**
- Expired JWT doesn't break roast generation
- Missing JWT doesn't break roast generation
- DB failures don't prevent roast response

---

## 🔍 Troubleshooting

### Issue: "on_conflict parameter not recognized"
**Cause:** Old Supabase Python client version
**Fix:** `pip install --upgrade supabase`

### Issue: "column 'provider_id' does not exist"
**Cause:** Schema not applied to Supabase
**Fix:** Run the SQL schema in Supabase SQL Editor

### Issue: "user_id violates foreign key constraint"
**Cause:** `login_events.user_id` is still TEXT type
**Fix:** Run migration:
```sql
ALTER TABLE login_events ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE login_events ADD CONSTRAINT login_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Issue: JWT decode fails with "user_id not found"
**Cause:** Using old JWT token from before fixes
**Fix:** Login again to get new JWT with `user_id` field
