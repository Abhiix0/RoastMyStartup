# Backend Changes Summary - Supabase User Persistence

## What Was Changed

### 1. `backend/app/routes/auth.py`
**Added:** User persistence after successful OAuth login

```python
# NEW CODE (line ~150, after user info fetch)
try:
    from app.services.db_service import db_service
    user_id = db_service.upsert_user(email=email, name=name, google_id=user_info.get("id"))
    logger.info(f"User {email} persisted to database with ID: {user_id}")
except Exception as db_error:
    logger.error(f"Failed to persist user {email} to database: {str(db_error)}")
```

**Why:** Every Google OAuth login now creates/updates a user record in Supabase.

---

### 2. `backend/app/services/db_service.py`
**Added:** Two new methods to `DatabaseService` class

#### Method 1: `upsert_user()`
```python
def upsert_user(self, email: str, name: str, google_id: Optional[str] = None) -> Optional[str]:
    """Create or update user (idempotent)"""
    user_data = {
        "email": email,
        "name": name,
        "google_id": google_id,
        "last_login": datetime.utcnow().isoformat(),
    }
    
    result = self.supabase.table("users").upsert(
        user_data,
        on_conflict="email"  # Prevents duplicates
    ).execute()
    
    return result.data[0].get("id") if result.data else None
```

**Why:** Handles both new users and returning users without creating duplicates.

#### Method 2: `get_user_by_email()`
```python
def get_user_by_email(self, email: str) -> Optional[dict]:
    """Retrieve user by email"""
    result = self.supabase.table("users").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None
```

**Why:** Needed to look up user_id when saving roasts.

#### Updated: `save_roast()` method signature
```python
# OLD
def save_roast(self, request: RoastRequest, response: RoastResponse) -> Optional[dict]:

# NEW
def save_roast(self, request: RoastRequest, response: RoastResponse, user_email: Optional[str] = None) -> Optional[dict]:
```

**Added logic:**
```python
# Look up user_id if email provided
user_id = None
if user_email:
    user = self.get_user_by_email(user_email)
    if user:
        user_id = user.get("id")

# Include user_id in roast data
roast_data = {
    # ... existing fields ...
    "user_id": user_id,  # NEW - links roast to user
}
```

**Why:** Roasts are now linked to users via foreign key.

---

### 3. `backend/app/main.py`
**Added:** JWT authentication to roast endpoint

#### Import changes:
```python
from fastapi import FastAPI, HTTPException, Header  # Added Header
import jwt  # Added jwt
from typing import Optional  # Added Optional
```

#### Updated endpoint signature:
```python
# OLD
async def roast_startup(request: RoastRequest):

# NEW
async def roast_startup(request: RoastRequest, authorization: Optional[str] = Header(None)):
```

#### Added JWT extraction logic:
```python
# Extract user email from JWT token if present
user_email = None
if authorization and authorization.startswith("Bearer "):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key or "dummy_key",
            algorithms=[settings.jwt_algorithm]
        )
        user_email = payload.get("email")
        logger.info(f"Authenticated user: {user_email}")
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired - proceeding as anonymous user")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token - proceeding as anonymous user")
```

#### Updated database save call:
```python
# OLD
db_result = db_service.save_roast(request, roast_response)

# NEW
db_result = db_service.save_roast(request, roast_response, user_email=user_email)
```

**Why:** Roast endpoint now knows who the user is and can link roasts to their account.

---

## Data Flow Summary

### Before Changes:
```
OAuth Login → JWT Created → Frontend stores JWT
Roast Request → AI generates roast → Save to DB (no user_id) → Return roast
```

### After Changes:
```
OAuth Login → User saved to DB → JWT Created → Frontend stores JWT
Roast Request + JWT → Extract email → AI generates roast → Lookup user_id → Save to DB with user_id → Return roast
```

---

## Testing the Changes

### 1. Test User Persistence
```bash
# Login with Google OAuth
# Check Supabase users table - should see new row

# Login again with same account
# Check Supabase users table - should update last_login, not create duplicate
```

### 2. Test Roast Linkage (Logged In)
```bash
# Login with Google OAuth
# Generate a roast
# Check Supabase roasts table - user_id should be populated
```

### 3. Test Roast Linkage (Anonymous)
```bash
# Don't login
# Generate a roast
# Check Supabase roasts table - user_id should be NULL
```

### 4. Test Error Handling
```bash
# Use expired JWT token
# Generate a roast
# Should still work (saves as anonymous)
```

---

## Required Supabase Schema

Your `users` table must have:
- `id` (UUID, primary key)
- `email` (TEXT, UNIQUE constraint)
- `name` (TEXT)
- `google_id` (TEXT)
- `last_login` (TIMESTAMP)

Your `roasts` table must have:
- `user_id` (UUID, foreign key to users.id, NULLABLE)

---

## No Frontend Changes Required

The frontend just needs to send the JWT token it already has:

```javascript
const token = localStorage.getItem('jwt_token');

fetch('/roast', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,  // This is the key part
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(roastData)
});
```

If your frontend already does this, no changes needed!
