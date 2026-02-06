-- ============================================
-- Supabase Migration - Fix login_events Table
-- ============================================
-- Run this in Supabase SQL Editor BEFORE deploying
-- This fixes the user_id type mismatch issue

-- Step 1: Fix login_events.user_id type (TEXT → UUID)
ALTER TABLE login_events 
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Step 2: Add foreign key constraint
ALTER TABLE login_events 
ADD CONSTRAINT login_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_events_user_id ON login_events(user_id);
CREATE INDEX IF NOT EXISTS idx_login_events_timestamp ON login_events(timestamp DESC);

-- Step 4: Add RLS policy for login_events (if not exists)
DROP POLICY IF EXISTS "Service role full access login_events" ON login_events;
CREATE POLICY "Service role full access login_events" ON login_events 
FOR ALL USING (auth.role() = 'service_role');

-- Step 5: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'login_events' 
ORDER BY ordinal_position;

-- Expected output:
-- id          | uuid      | NO
-- user_id     | uuid      | NO  ← Should be UUID now
-- provider    | text      | NO
-- success     | boolean   | YES
-- timestamp   | timestamp | YES
-- ip_address  | text      | YES
-- user_agent  | text      | YES

-- ============================================
-- Verification Queries
-- ============================================

-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check roasts table has user_id column
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'roasts' 
AND column_name = 'user_id';

-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('roasts', 'login_events', 'user_preferences');

-- ============================================
-- Test Queries (Run after backend deployment)
-- ============================================

-- Test 1: Check if users are being created
SELECT 
    id,
    provider_id,
    email,
    name,
    provider,
    last_login,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Test 2: Check if login events are being logged
SELECT 
    le.id,
    le.user_id,
    u.email,
    le.provider,
    le.success,
    le.timestamp,
    le.ip_address
FROM login_events le
JOIN users u ON le.user_id = u.id
ORDER BY le.timestamp DESC
LIMIT 5;

-- Test 3: Check if roasts are linked to users
SELECT 
    r.id,
    r.startup_name,
    r.user_id,
    u.email,
    u.name,
    r.created_at
FROM roasts r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 10;

-- Test 4: Count roasts per user
SELECT 
    u.email,
    u.name,
    COUNT(r.id) as roast_count
FROM users u
LEFT JOIN roasts r ON u.id = r.user_id
GROUP BY u.id, u.email, u.name
ORDER BY roast_count DESC;

-- Test 5: Count anonymous vs authenticated roasts
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'Anonymous'
        ELSE 'Authenticated'
    END as roast_type,
    COUNT(*) as count
FROM roasts
GROUP BY roast_type;
