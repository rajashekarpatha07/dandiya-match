# Admin Panel Quick Reference

## 🚀 Quick Start

1. **Apply the database migration:**
   ```bash
   npx supabase db push
   ```

2. **Make yourself an admin:**
   ```sql
   -- In Supabase Dashboard > SQL Editor
   UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';
   ```

3. **Access the admin panel:**
   - Navigate to `/admin` or click "Admin" tab in navigation
   - Only visible if you're an admin

## 📍 Features Overview

### Venue Management
| Action | How To |
|--------|--------|
| Add venue | Click "+ Add Venue" → Fill form → "Create Venue" |
| Edit venue | Click "Edit" on venue card → Update fields → "Update Venue" |
| Delete venue | Click "Delete" → "Confirm Delete" |
| Toggle active status | Edit venue → Toggle "Active" checkbox |

### Event Management
| Action | How To |
|--------|--------|
| Manage events | Click "Manage Events" on venue card |
| Add event | Click "+ Add Event Date" → Select date/times → "Add Event" |
| Delete event | Click "Delete" on event → Confirm |
| Return to venues | Click "← Back" |

## 🗄️ Database Structure

### Tables Modified
- **profiles**: Added `is_admin` column
- **venues**: Full CRUD access for admins
- **venue_events**: Full CRUD access for admins

### RLS Policies Created
- `admin venues all` - Admins can do anything with venues
- `admin events all` - Admins can do anything with venue_events

### Functions Added
- `is_admin()` - Returns true if current user is admin

## 🔐 Admin Management

### Make a user admin:
```sql
UPDATE profiles SET is_admin = true WHERE id = 'USER_ID';
```

### Remove admin privileges:
```sql
UPDATE profiles SET is_admin = false WHERE id = 'USER_ID';
```

### List all admins:
```sql
SELECT id, display_name, is_admin FROM profiles WHERE is_admin = true;
```

## 📝 Required Fields

### Venue (minimum):
- Name ✅
- Latitude ✅
- Longitude ✅

### Venue (optional):
- Area
- Address
- Entry Fee
- Description
- Image URL
- Active status (defaults to true)

### Event (minimum):
- Event Date ✅

### Event (optional):
- Start Time
- End Time

## 🎯 Common Tasks

### Add a new venue for tomorrow's event
1. Click "+ Add Venue"
2. Fill: Name, coordinates, entry fee
3. Mark as "Active"
4. Click "Create Venue"
5. Click "Manage Events" on the new venue
6. Click "+ Add Event Date"
7. Select tomorrow's date
8. Add start/end times
9. Click "Add Event"

### Deactivate a venue temporarily
1. Find the venue
2. Click "Edit"
3. Uncheck "Active (visible to users)"
4. Click "Update Venue"

### Bulk add events for a venue
1. Click "Manage Events" on the venue
2. Click "+ Add Event Date"
3. Add first date → "Add Event"
4. Repeat for each date

## ⚠️ Important Notes

1. **Deleting venues** removes all associated events, listings, and requests
2. **Deleting events** removes all partner listings and match requests for that event
3. **Inactive venues** don't appear on the user-facing map
4. **Past events** are automatically hidden from regular users (still visible in admin)
5. **Coordinates** are used for map markers - double-check they're correct
6. **Entry fee** should be in rupees (₹)

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see Admin tab | Check `is_admin = true` in database, refresh page |
| "Access Denied" on /admin | Make sure you're logged in as admin user |
| Can't create venue | Check RLS policies are applied, verify admin status |
| Venue not showing on map | Check if venue is marked as "Active" |
| Events not showing for users | Check event date is today or in future |

## 📊 Monitoring

### Check venue count:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active) as active,
  COUNT(*) FILTER (WHERE NOT is_active) as inactive
FROM venues;
```

### Check events count:
```sql
SELECT 
  v.name,
  COUNT(ve.id) as event_count
FROM venues v
LEFT JOIN venue_events ve ON ve.venue_id = v.id
GROUP BY v.id, v.name
ORDER BY event_count DESC;
```

### Check admin users:
```sql
SELECT 
  display_name,
  created_at,
  onboarded
FROM profiles 
WHERE is_admin = true;
```

## 🔄 Updates & Maintenance

The admin system uses React Query for caching. Changes you make will:
- ✅ Update immediately in the admin panel
- ✅ Update on user-facing pages automatically
- ✅ Invalidate relevant query caches
- ✅ Sync across all open tabs/windows

No manual cache clearing needed!
