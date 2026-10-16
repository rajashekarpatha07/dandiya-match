# Admin Functionality Testing Checklist

## ✅ Build Verification
- [x] Code compiles without errors
- [x] Next.js build succeeds
- [x] All TypeScript types are correct
- [x] Admin page route is generated

## Database Setup

### 1. Apply Migration
```bash
cd /home/raj/Desktop/Projects/Dandia_Match
npx supabase db push
```

Or manually run the SQL from `supabase/migrations/002_admin_support.sql` in Supabase Dashboard.

### 2. Create Admin User
Run this SQL in Supabase Dashboard > SQL Editor:

```sql
-- Find your user ID
SELECT id, display_name, is_admin FROM profiles;

-- Make yourself admin (replace with your actual user ID)
UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID_HERE';

-- Verify
SELECT id, display_name, is_admin FROM profiles WHERE is_admin = true;
```

## Manual Testing Checklist

### Access Control Tests
- [ ] **Non-admin users cannot see Admin tab** in navigation
- [ ] **Non-admin users cannot access /admin** (shows "Access Denied")
- [ ] **Admin users CAN see Admin tab** in navigation
- [ ] **Admin users CAN access /admin page**

### Venue CRUD Operations

#### Create Venue
- [ ] Click "Add Venue" button
- [ ] Fill in all required fields (Name, Latitude, Longitude)
- [ ] Fill in optional fields (Area, Address, Entry Fee, Description, Image URL)
- [ ] Toggle "Active" checkbox
- [ ] Click "Create Venue"
- [ ] Verify success toast appears
- [ ] Verify new venue appears in the list

#### Read/View Venues
- [ ] All venues display correctly (active and inactive)
- [ ] Venue cards show all information:
  - Name, Area, Address
  - Description
  - Entry Fee badge
  - Active/Inactive status badge
  - Coordinates badge
- [ ] Empty state shows when no venues exist

#### Update Venue
- [ ] Click "Edit" on a venue card
- [ ] Form pre-populates with existing data
- [ ] Change some fields
- [ ] Click "Update Venue"
- [ ] Verify success toast
- [ ] Verify changes are reflected in the list

#### Delete Venue
- [ ] Click "Delete" on a venue card
- [ ] "Confirm Delete" and "Cancel" buttons appear
- [ ] Click "Cancel" - delete is cancelled
- [ ] Click "Delete" again, then "Confirm Delete"
- [ ] Verify success toast
- [ ] Verify venue is removed from list

### Event Management

#### Access Event Manager
- [ ] Click "Manage Events" on a venue card
- [ ] Event manager interface opens
- [ ] Venue name is displayed at the top
- [ ] "Back" button returns to venue list

#### Create Event
- [ ] Click "Add Event Date"
- [ ] Event form appears
- [ ] Select event date
- [ ] Optionally add start time and end time
- [ ] Click "Add Event"
- [ ] Verify success toast
- [ ] Verify new event appears in the list

#### View Events
- [ ] All events for venue are listed
- [ ] Events show date and time (if provided)
- [ ] Events are sorted by date
- [ ] Empty state shows when no events exist

#### Delete Event
- [ ] Click "Delete" on an event
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - deletion is cancelled
- [ ] Click "Delete" and confirm
- [ ] Verify success toast
- [ ] Verify event is removed from list

### User-Facing Impact Tests

#### Verify Regular User Experience
- [ ] Log out and log in as a non-admin user
- [ ] Visit home page (/) - map view
- [ ] Verify active venues appear on map
- [ ] Verify inactive venues do NOT appear
- [ ] Click on a venue marker
- [ ] Navigate to venue detail page
- [ ] Verify upcoming events are listed
- [ ] Click on an event
- [ ] Verify can create partner listing

#### Query Invalidation
- [ ] As admin, mark a venue as inactive
- [ ] Check that it disappears from user-facing map
- [ ] As admin, add a new event to a venue
- [ ] Check that it appears on venue detail page
- [ ] As admin, delete an event
- [ ] Check that it's removed from venue detail page

### Error Handling

#### Form Validation
- [ ] Try to create venue without name - validation error
- [ ] Try to create venue without lat/lng - validation error
- [ ] Try to enter invalid coordinates - validation error

#### Network Errors
- [ ] Test behavior when offline/network error occurs
- [ ] Verify error toasts display properly
- [ ] Verify error states show retry buttons

### UI/UX Tests

#### Responsive Design
- [ ] Test on mobile viewport - layout adapts correctly
- [ ] Test on tablet viewport - layout adapts correctly
- [ ] Test on desktop viewport - layout looks good
- [ ] Navigation works on all screen sizes

#### Loading States
- [ ] Spinners show while loading data
- [ ] Buttons show loading text while submitting
- [ ] No flash of wrong content

#### Toast Notifications
- [ ] Success toasts are green/orange
- [ ] Error toasts are red
- [ ] Toasts auto-dismiss after 4 seconds
- [ ] Can manually close toasts with X button

## Performance Tests

- [ ] Large venue list (20+ venues) loads quickly
- [ ] Venue with many events (10+ events) loads quickly
- [ ] No memory leaks when adding/editing/deleting multiple times
- [ ] Query cache invalidation works correctly

## Security Tests

### Row Level Security (RLS)
Run these tests in Supabase Dashboard > SQL Editor:

```sql
-- Test 1: Non-admin cannot insert venue
-- Switch to a non-admin user context or use the API
-- Should fail with permission denied

-- Test 2: Admin can insert venue
-- Should succeed when is_admin = true

-- Test 3: Non-admin can only read active venues
SELECT * FROM venues WHERE is_active = false;
-- Should return empty if queried as non-admin

-- Test 4: Admin can read all venues
SELECT * FROM venues;
-- Should return all venues when queried as admin
```

## Known Issues / Limitations

Document any issues found during testing:

- [ ] Issue: _______________
  - Steps to reproduce: _______________
  - Expected behavior: _______________
  - Actual behavior: _______________

## Sign-off

- [ ] All critical tests pass
- [ ] All blocking issues are resolved or documented
- [ ] Admin functionality is ready for use

Tested by: __________________
Date: __________________
