# Admin Setup Instructions

## Step 1: Apply Database Migration

You need to apply the admin migration to your Supabase database. You have two options:

### Option A: Using Supabase CLI (Recommended)
```bash
cd /home/raj/Desktop/Projects/Dandia_Match
npx supabase db push
```

When prompted, select "Yes" to push the migrations. If you get an error about existing tables, the migration 002_admin_support.sql will be applied.

### Option B: Manual SQL Execution

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to: SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_admin_support.sql`
4. Click "Run" to execute the SQL

## Step 2: Make Yourself an Admin

After applying the migration, you need to set your user as an admin:

1. Go to Supabase Dashboard > SQL Editor
2. Run this query (replace `YOUR_USER_ID` with your actual user ID):

```sql
-- Find your user ID first
SELECT id, display_name FROM profiles WHERE display_name = 'YOUR_NAME';

-- Or get all users
SELECT id, display_name, is_admin FROM profiles;

-- Make yourself admin (use the ID from above)
UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';

-- Verify
SELECT display_name, is_admin FROM profiles WHERE id = 'YOUR_USER_ID';
```

## Step 3: Test the Admin Features

1. Start your development server:
```bash
npm run dev
```

2. Navigate to your app and log in
3. You should see an "Admin" tab in the navigation
4. Click on it to access the admin panel

## Admin Features

Once you're in the admin panel, you can:

### Venue Management
- ✅ **View all venues** (active and inactive)
- ✅ **Add new venues** with all details:
  - Name, Area, Address
  - Latitude & Longitude (for map placement)
  - Entry Fee
  - Description
  - Image URL
  - Active/Inactive status
- ✅ **Edit existing venues**
- ✅ **Delete venues** (with confirmation)

### Event Management (per venue)
- ✅ **View all events** for a specific venue
- ✅ **Add event dates** with optional start/end times
- ✅ **Delete events** (removes associated listings/requests)

## Security Notes

- Only users with `is_admin = true` can access the admin page
- Row Level Security (RLS) policies ensure only admins can modify venues and events
- Regular users can only read active venues and events
- The admin navigation link only appears for admin users

## Troubleshooting

### Migration Already Applied Error
If you get an error saying the migration is already applied, that's okay. Check if the `is_admin` column exists:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_admin';
```

If it doesn't exist, run the ALTER TABLE command manually:

```sql
ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
```

Then run the rest of the migration file.

### Can't See Admin Tab
Make sure:
1. The migration has been applied
2. Your user has `is_admin = true` in the database
3. You've refreshed the page after making yourself admin
4. Check browser console for any errors

### Permission Errors
If you get permission errors when trying to create/update/delete:
1. Verify the RLS policies were created correctly
2. Check that you're logged in as an admin user
3. Look at the browser console and network tab for detailed error messages
