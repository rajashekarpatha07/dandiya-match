# 🚀 How to Apply the Admin Migration

## Quick Steps

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project: **rugdhvihilyefqselace**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **"+ New Query"** button
2. Open the file: `APPLY_ADMIN_MIGRATION.sql` (in this folder)
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Check the Results
You should see output like:
```
NOTICE: Added is_admin column to profiles table
NOTICE: Created admin venues policy
NOTICE: Created admin events policy
NOTICE: ===========================================
NOTICE: MIGRATION VERIFICATION:
NOTICE: ===========================================
NOTICE: Column is_admin exists: true
NOTICE: Admin policies created: 2 of 2
NOTICE: Function is_admin exists: true
NOTICE: ===========================================
NOTICE: ✓ MIGRATION SUCCESSFUL!
NOTICE: ===========================================
```

### Step 4: Make Yourself Admin
In the same SQL Editor, run these queries:

```sql
-- Find your user ID
SELECT id, display_name, is_admin FROM profiles;
```

Copy your user ID from the results, then run:

```sql
-- Make yourself admin (replace with YOUR actual ID)
UPDATE profiles SET is_admin = true WHERE id = '5e6d62d0-bf9a-46f2-b437-4ab52c4b24df';
```

Verify it worked:

```sql
-- Check admin status
SELECT display_name, is_admin FROM profiles WHERE is_admin = true;
```

You should see your account with `is_admin: true`

### Step 5: Test the Admin Panel
1. Refresh your application
2. You should now see the **"Admin"** tab in the navigation
3. Click it to access `/admin`
4. Try adding a test venue!

## Troubleshooting

### If you get "column already exists"
This is fine! The migration is designed to be safe to run multiple times. It will skip creating things that already exist.

### If you get permission errors
Make sure you're running the SQL in Supabase Dashboard as the project owner, not through the application.

### If the Admin tab doesn't appear
1. Make sure the migration ran successfully
2. Verify you set `is_admin = true` for your user
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for any errors

### If you want to start fresh
If you really want to reset everything, you can drop and recreate tables, but **this will delete all your data**. Only do this if you're sure:

```sql
-- ⚠️ WARNING: THIS DELETES ALL DATA ⚠️
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS match_requests CASCADE;
DROP TABLE IF EXISTS partner_listings CASCADE;
DROP TABLE IF EXISTS venue_events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS profile_contacts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run the full migration from 001_init.sql
-- Then run the admin migration from APPLY_ADMIN_MIGRATION.sql
```

But I **strongly recommend** just running the `APPLY_ADMIN_MIGRATION.sql` file instead of resetting!

## Alternative: Using Supabase CLI

If you prefer using the CLI and have Supabase linked:

```bash
cd /home/raj/Desktop/Projects/Dandia_Match

# Link to your project (if not already linked)
npx supabase link --project-ref rugdhvihilyefqselace

# Push migrations
npx supabase db push
```

When prompted about existing migrations, select the option to skip already-applied migrations.

## What This Migration Does

1. ✅ Adds `is_admin` column to profiles table
2. ✅ Creates RLS policy allowing admins to manage venues
3. ✅ Creates RLS policy allowing admins to manage events
4. ✅ Creates `is_admin()` function to check admin status
5. ✅ Safe to run multiple times (won't break existing data)

## Need Help?

If you run into issues:
1. Check the SQL Editor output for specific error messages
2. Share the error message and I can help debug
3. Make sure you're logged into Supabase Dashboard as the project owner
