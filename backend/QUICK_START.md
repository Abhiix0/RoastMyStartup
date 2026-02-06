# ⚡ Quick Start - Get Running in 5 Minutes

## What You Need

From your Supabase screenshot, I can see your project URL:
```
https://matsabgmmcuppluzbvm.supabase.co
```

You need 3 more things:

1. **Supabase Service Role Key** (from Supabase dashboard)
2. **Google OAuth Credentials** (from Google Cloud Console)
3. **Gemini API Key** (if you don't have it already)

---

## 1️⃣ Create .env File (2 minutes)

```bash
cd backend
cp .env.example .env
nano .env  # or use any text editor
```

Fill in these values:

```bash
# From Supabase Dashboard → Settings → API
SUPABASE_URL=https://matsabgmmcuppluzbvm.supabase.co
SUPABASE_KEY=eyJ...your_service_role_key_here

# From Google AI Studio
GEMINI_API_KEY=AIza...your_gemini_key_here

# From Google Cloud Console → Credentials
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...your_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=your_random_32_char_hex_string_here

# Local frontend URL
FRONTEND_BASE_URL=http://localhost:8080
```

---

## 2️⃣ Install & Run (1 minute)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Look for: "✅ Supabase database connection healthy"

---

## 3️⃣ Test Login (1 minute)

Open in browser:
```
http://localhost:8000/auth/google
```

Sign in with Google → You'll be redirected back with a token

---

## 4️⃣ Verify in Supabase (1 minute)

Go to your Supabase Table Editor:

**Check users table:**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```
✅ You should see your email and Google profile

**Check login_events table:**
```sql
SELECT * FROM login_events ORDER BY timestamp DESC LIMIT 1;
```
✅ You should see a login event

**Check roasts table:**
After generating a roast, check:
```sql
SELECT r.startup_name, r.user_id, u.email 
FROM roasts r 
LEFT JOIN users u ON r.user_id = u.id 
ORDER BY r.created_at DESC 
LIMIT 5;
```
✅ Authenticated roasts will have user_id populated
✅ Anonymous roasts will have user_id = NULL

---

## 🎯 That's It!

Your backend is now:
- ✅ Storing every user login in Supabase
- ✅ Tracking login events
- ✅ Linking roasts to users
- ✅ Supporting anonymous roasts

---

## 🆘 Need Help?

### Can't find Supabase Service Role Key?
1. Go to: https://supabase.com/dashboard/project/matsabgmmcuppluzbvm/settings/api
2. Look for "service_role" section (NOT "anon public")
3. Click "Reveal" and copy the key

### Don't have Google OAuth credentials?
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:8000/auth/google/callback`

### Need Gemini API Key?
1. Go to: https://aistudio.google.com/app/apikey
2. Create API key
3. Copy and paste into .env

---

## 📖 Full Documentation

See `SETUP_GUIDE.md` for detailed instructions and troubleshooting.
