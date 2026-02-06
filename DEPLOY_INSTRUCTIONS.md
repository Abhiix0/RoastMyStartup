# 🚀 Deploy Instructions - Push Fixes to Production

## Current Status

✅ **Backend fixes are committed locally** (commit: f85e57f)
✅ **Render environment variables are configured**
❌ **Fixes not deployed yet** - Need to push to GitHub

---

## What Was Fixed

The backend now correctly:
1. ✅ Uses `provider_id` (Google's unique ID) instead of email for user identification
2. ✅ Logs every login to `login_events` table
3. ✅ Includes `user_id` in JWT tokens
4. ✅ Links roasts to users via `user_id` (not email lookup)
5. ✅ Stores user profile pictures
6. ✅ Supports anonymous roasts (user_id = NULL)

---

## Step 1: Push to GitHub

```bash
git push origin main
```

If you get authentication error, you need to:
- Use SSH instead of HTTPS, OR
- Set up a GitHub Personal Access Token

### Option A: Switch to SSH (Recommended)
```bash
git remote set-url origin git@github.com:Aaravx0/RoastMyStartup.git
git push origin main
```

### Option B: Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy the token
5. Use it as password when pushing

---

## Step 2: Verify Render Deployment

After pushing, Render will automatically deploy:

1. Go to your Render dashboard: https://dashboard.render.com
2. Find your backend service
3. Watch the deployment logs
4. Wait for "Deploy succeeded" message (usually 2-3 minutes)

---

## Step 3: Test Production Backend

### A. Check Health Endpoint
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "alive",
  "model": "gemini-2.5-flash",
  "database": "healthy"
}
```

### B. Test OAuth Login

Open in browser:
```
https://your-backend-url.onrender.com/auth/google
```

Complete Google sign-in → You should be redirected to your frontend with a JWT token

### C. Verify in Supabase

Go to Supabase Table Editor:

**Check users table:**
```sql
SELECT provider_id, email, name, picture, provider, last_login 
FROM users 
ORDER BY created_at DESC 
LIMIT 1;
```

✅ Should see your Google profile with `provider_id` populated

**Check login_events table:**
```sql
SELECT user_id, provider, success, timestamp 
FROM login_events 
ORDER BY timestamp DESC 
LIMIT 1;
```

✅ Should see a login event with matching `user_id`

**Check roasts table:**
```sql
SELECT r.startup_name, r.user_id, u.email 
FROM roasts r 
LEFT JOIN users u ON r.user_id = u.id 
ORDER BY r.created_at DESC 
LIMIT 5;
```

✅ New roasts should have `user_id` populated (if logged in)
✅ Old roasts might have `user_id = NULL` (that's okay)

---

## Step 4: Update Frontend (If Needed)

Your frontend should already be sending the JWT token in the Authorization header.

Check `src/lib/api.ts` to verify it includes:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🎯 Success Checklist

After deployment, verify:

- [ ] Render deployment succeeded
- [ ] Health endpoint returns "database": "healthy"
- [ ] Google OAuth login works
- [ ] User appears in Supabase `users` table with `provider_id`
- [ ] Login event appears in `login_events` table
- [ ] New roasts have `user_id` populated (when logged in)
- [ ] Anonymous roasts still work (user_id = NULL)

---

## 🐛 Troubleshooting

### Render deployment fails
**Check:** Render build logs for errors
**Fix:** Make sure all dependencies are in `requirements.txt`

### "column 'provider_id' does not exist"
**Problem:** Supabase schema not updated
**Fix:** Run the SQL schema in Supabase SQL Editor (from the review)

### "login_events.user_id type mismatch"
**Problem:** `login_events.user_id` is TEXT instead of UUID
**Fix:** Run this in Supabase SQL Editor:
```sql
ALTER TABLE login_events 
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE login_events 
ADD CONSTRAINT login_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Users not appearing in Supabase
**Check:** Render logs for database errors
**Fix:** Verify `SUPABASE_KEY` is the **service_role** key in Render environment variables

### JWT doesn't contain user_id
**Problem:** Using old JWT from before deployment
**Fix:** Login again to get new JWT with `user_id` field

---

## 📊 What Happens After Deployment

### On Every Login:
1. User profile saved/updated in `users` table
2. Login event logged in `login_events` table
3. JWT token issued with `user_id`

### On Every Roast:
1. If user is logged in → roast linked to their `user_id`
2. If user is anonymous → roast saved with `user_id = NULL`
3. All roast data stored in `roasts` table

---

## 🎉 You're Done!

Once you push to GitHub and Render deploys, your backend will automatically:
- ✅ Store every user login in Supabase
- ✅ Track all login events
- ✅ Link roasts to authenticated users
- ✅ Support anonymous roasts

No further code changes needed!
