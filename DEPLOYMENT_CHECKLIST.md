# ✅ Deployment Checklist

## Your Situation
- ✅ Backend code is fixed (locally committed)
- ✅ Render environment variables are configured
- ✅ Supabase tables exist
- ❌ Need to deploy to production

---

## 3 Steps to Get Everything Working

### Step 1: Fix Supabase Schema (2 minutes)

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/matsabgmmcuppluzbvm/sql
2. Open the file: `backend/SUPABASE_MIGRATION.sql`
3. Copy all the SQL
4. Paste into Supabase SQL Editor
5. Click **RUN**

✅ This fixes the `login_events.user_id` type mismatch (TEXT → UUID)

---

### Step 2: Deploy Backend to Render (5 minutes)

```bash
# Push your code to GitHub
git push origin main
```

If you get authentication error:
```bash
# Use SSH instead
git remote set-url origin git@github.com:Aaravx0/RoastMyStartup.git
git push origin main
```

Then:
1. Go to Render dashboard: https://dashboard.render.com
2. Find your backend service
3. Watch deployment logs
4. Wait for "Deploy succeeded" (2-3 minutes)

---

### Step 3: Test Everything (3 minutes)

#### A. Test OAuth Login
Open in browser:
```
https://your-backend-url.onrender.com/auth/google
```

Sign in with Google → Should redirect to frontend with token

#### B. Check Supabase Tables

**Users table:**
```sql
SELECT provider_id, email, name, picture, provider 
FROM users 
ORDER BY created_at DESC 
LIMIT 1;
```
✅ Should see your profile with `provider_id` populated

**Login events table:**
```sql
SELECT user_id, provider, timestamp 
FROM login_events 
ORDER BY timestamp DESC 
LIMIT 1;
```
✅ Should see a login event

**Roasts table:**
```sql
SELECT r.startup_name, r.user_id, u.email 
FROM roasts r 
LEFT JOIN users u ON r.user_id = u.id 
ORDER BY r.created_at DESC 
LIMIT 5;
```
✅ New roasts should have `user_id` populated

---

## That's It! 🎉

After these 3 steps:
- ✅ Every login will be stored in Supabase
- ✅ Every roast will be linked to the user
- ✅ Anonymous roasts still work
- ✅ Login events are tracked

---

## Quick Troubleshooting

### "column 'provider_id' does not exist"
→ Run the SQL migration in Supabase

### "user_id type mismatch"
→ Run the SQL migration in Supabase

### "Authentication failed" when pushing
→ Use SSH: `git remote set-url origin git@github.com:Aaravx0/RoastMyStartup.git`

### Users not appearing in Supabase
→ Check Render logs for errors
→ Verify `SUPABASE_KEY` is the **service_role** key (not anon key)

---

## Need More Help?

See detailed guides:
- `DEPLOY_INSTRUCTIONS.md` - Full deployment guide
- `backend/SUPABASE_MIGRATION.sql` - SQL to run in Supabase
- `backend/FIXES_APPLIED.md` - What was changed in the code
