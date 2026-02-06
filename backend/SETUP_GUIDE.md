# 🚀 Setup Guide - RoastMyStartup Backend

## Current Status

✅ **Backend code is ready** - All fixes have been applied
✅ **Supabase tables exist** - I can see your tables in the screenshot
❌ **Missing .env file** - You need to configure environment variables

---

## Step 1: Create .env File

Copy the example file and fill in your credentials:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your actual values:

```bash
# Required - Get from Supabase Dashboard
SUPABASE_URL=https://matsabgmmcuppluzbvm.supabase.co
SUPABASE_KEY=your_service_role_key_here

# Required - Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Required - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Required - Generate a random secret
JWT_SECRET_KEY=your_random_secret_key_here

# Optional - Frontend URL
FRONTEND_BASE_URL=http://localhost:8080
```

---

## Step 2: Get Your Supabase Credentials

### A. Supabase URL (Already visible in your screenshot)
```
https://matsabgmmcuppluzbvm.supabase.co
```

### B. Supabase Service Role Key

1. Go to your Supabase project: https://supabase.com/dashboard/project/matsabgmmcuppluzbvm
2. Click **Settings** (gear icon) in left sidebar
3. Click **API** section
4. Find **service_role** key (NOT anon key)
5. Copy the long key starting with `eyJ...`

⚠️ **Important:** Use the **service_role** key, not the anon key!

---

## Step 3: Get Google OAuth Credentials

### A. Go to Google Cloud Console
https://console.cloud.google.com/apis/credentials

### B. Create OAuth 2.0 Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `RoastMyStartup Local`
4. **Authorized redirect URIs:** Add:
   ```
   http://localhost:8000/auth/google/callback
   ```
5. Click **CREATE**
6. Copy the **Client ID** and **Client Secret**

---

## Step 4: Generate JWT Secret Key

Run this command to generate a secure random key:

```bash
openssl rand -hex 32
```

Copy the output and use it as `JWT_SECRET_KEY` in your `.env` file.

---

## Step 5: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 6: Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Starting RoastMyStartup API
INFO:     Using Gemini model: gemini-2.5-flash
INFO:     ✅ Gemini API key configured successfully
INFO:     ✅ Supabase database connection healthy
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 7: Test User Login

### A. Open OAuth Login
```
http://localhost:8000/auth/google
```

### B. Complete Google Sign-In

You'll be redirected through Google OAuth and back to your frontend.

### C. Verify in Supabase

Go to your Supabase Table Editor and check:

**users table:**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```

You should see:
- ✅ Your email
- ✅ Your name
- ✅ provider_id (Google's user ID)
- ✅ picture (your Google profile picture URL)
- ✅ provider = 'google'
- ✅ last_login timestamp

**login_events table:**
```sql
SELECT * FROM login_events ORDER BY timestamp DESC LIMIT 1;
```

You should see:
- ✅ user_id (matching the users table)
- ✅ provider = 'google'
- ✅ success = true
- ✅ timestamp
- ✅ ip_address
- ✅ user_agent

---

## Step 8: Test Roast Generation

### A. Get Your JWT Token

After logging in, you'll be redirected to:
```
http://localhost:8080/auth/callback?token=eyJ...
```

Copy the token from the URL.

### B. Generate a Roast (Authenticated)

```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "startup_name": "TestStartup",
    "idea_description": "An AI-powered app that does something",
    "target_users": "Tech enthusiasts",
    "budget": "$10k",
    "roast_level": "Medium"
  }'
```

### C. Verify in Supabase

**roasts table:**
```sql
SELECT r.*, u.email 
FROM roasts r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC 
LIMIT 1;
```

You should see:
- ✅ startup_name = 'TestStartup'
- ✅ user_id = your user UUID (NOT NULL)
- ✅ email = your email (from join)
- ✅ All roast fields populated

---

## Step 9: Test Anonymous Roast

```bash
curl -X POST http://localhost:8000/roast \
  -H "Content-Type: application/json" \
  -d '{
    "startup_name": "AnonStartup",
    "idea_description": "Testing anonymous roast",
    "target_users": "Everyone",
    "budget": "$5k",
    "roast_level": "Soft"
  }'
```

### Verify in Supabase

```sql
SELECT * FROM roasts WHERE startup_name = 'AnonStartup';
```

You should see:
- ✅ startup_name = 'AnonStartup'
- ✅ user_id = NULL (anonymous)
- ✅ All roast fields populated

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Backend starts without errors
- [ ] Google OAuth login works
- [ ] User appears in `users` table with `provider_id`
- [ ] Login event appears in `login_events` table
- [ ] JWT token contains `user_id` field
- [ ] Authenticated roasts have `user_id` populated
- [ ] Anonymous roasts have `user_id = NULL`

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL is required"
**Fix:** Create `backend/.env` file with your Supabase credentials

### Error: "Failed to initialize Supabase client"
**Fix:** Check that `SUPABASE_KEY` is the **service_role** key, not anon key

### Error: "OAuth configuration error"
**Fix:** Add all Google OAuth variables to `.env` file

### Error: "redirect_uri_mismatch"
**Fix:** Add `http://localhost:8000/auth/google/callback` to Google Cloud Console authorized redirect URIs

### Error: "column 'provider_id' does not exist"
**Fix:** Your Supabase schema is outdated. Run the SQL schema from the review.

### Backend starts but no data in Supabase
**Fix:** Check backend logs for errors. Look for "❌" symbols indicating DB failures.

---

## 📊 What Gets Stored in Supabase

### On Every Login:
1. **users table** - User profile (upserted, no duplicates)
   - provider_id (Google's unique ID)
   - email
   - name
   - picture
   - provider ('google')
   - last_login (updated each time)

2. **login_events table** - Audit trail
   - user_id
   - provider
   - timestamp
   - ip_address
   - user_agent

### On Every Roast:
3. **roasts table** - Roast data
   - startup_name
   - idea_description
   - target_users
   - budget
   - roast_level
   - brutal_roast (AI response)
   - honest_feedback (AI response)
   - competitor_reality_check (AI response)
   - survival_tips (AI response)
   - pitch_rewrite (AI response)
   - user_id (if authenticated, NULL if anonymous)
   - created_at

---

## 🎯 Next Steps

Once everything is working locally:

1. **Deploy Backend** - Deploy to Render or similar
2. **Update OAuth Redirect** - Add production URL to Google Cloud Console
3. **Update .env** - Set production URLs in environment variables
4. **Test Production** - Verify everything works in production

Your backend is **ready to store all user data and roasts in Supabase**. You just need to configure the environment variables!
