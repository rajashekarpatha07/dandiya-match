-- =========================================================
-- ADMIN MIGRATION - Safe to run multiple times
-- =========================================================
-- This adds admin support to your Dandiya Match database
-- Run this in Supabase Dashboard > SQL Editor
-- =========================================================

-- Step 1: Add is_admin column (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
    RAISE NOTICE 'Added is_admin column to profiles table';
  ELSE
    RAISE NOTICE 'is_admin column already exists';
  END IF;
END $$;

-- Step 2: Create admin RLS policies for venues
DO $$
BEGIN
  -- Drop policy if it exists, then recreate
  DROP POLICY IF EXISTS "admin venues all" ON venues;
  
  CREATE POLICY "admin venues all" ON venues
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  
  RAISE NOTICE 'Created admin venues policy';
END $$;

-- Step 3: Create admin RLS policies for venue_events
DO $$
BEGIN
  -- Drop policy if it exists, then recreate
  DROP POLICY IF EXISTS "admin events all" ON venue_events;
  
  CREATE POLICY "admin events all" ON venue_events
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  
  RAISE NOTICE 'Created admin events policy';
END $$;

-- Step 4: Create is_admin() function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Step 5: Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =========================================================
-- VERIFICATION
-- =========================================================
-- Check that everything was created successfully
DO $$
DECLARE
  v_column_exists boolean;
  v_policy_count int;
  v_function_exists boolean;
BEGIN
  -- Check column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) INTO v_column_exists;
  
  -- Check policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename IN ('venues', 'venue_events') 
    AND policyname LIKE 'admin%';
  
  -- Check function
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin'
  ) INTO v_function_exists;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'MIGRATION VERIFICATION:';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Column is_admin exists: %', v_column_exists;
  RAISE NOTICE 'Admin policies created: % of 2', v_policy_count;
  RAISE NOTICE 'Function is_admin exists: %', v_function_exists;
  RAISE NOTICE '===========================================';
  
  IF v_column_exists AND v_policy_count = 2 AND v_function_exists THEN
    RAISE NOTICE '✓ MIGRATION SUCCESSFUL!';
  ELSE
    RAISE WARNING '✗ MIGRATION INCOMPLETE - Check errors above';
  END IF;
  RAISE NOTICE '===========================================';
END $$;

-- =========================================================
-- NEXT STEPS
-- =========================================================
-- After running this migration, make yourself an admin:
-- 
-- 1. Find your user ID:
--    SELECT id, display_name, is_admin FROM profiles;
--
-- 2. Make yourself admin:
--    UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';
--
-- 3. Verify:
--    SELECT display_name, is_admin FROM profiles WHERE is_admin = true;
-- =========================================================
