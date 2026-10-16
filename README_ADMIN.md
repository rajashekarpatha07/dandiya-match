# 🎯 Admin Panel - Quick Start

## What You Get

A complete admin dashboard to manage venues and events for your Dandiya Match app!

## ⚡ 3-Step Setup

### 1️⃣ Apply Migration
```bash
cd /home/raj/Desktop/Projects/Dandia_Match
npx supabase db push
```
Select **Yes** when prompted.

### 2️⃣ Make Yourself Admin
In Supabase Dashboard → SQL Editor:
```sql
SELECT id, display_name FROM profiles;
UPDATE profiles SET is_admin = true WHERE id = 'YOUR_ID_HERE';
```

### 3️⃣ Access Admin Panel
```bash
npm run dev
```
Navigate to **`/admin`** or click **"Admin"** in the nav!

## 🎪 What You Can Do

| Feature | Description |
|---------|-------------|
| 📍 **Add Venues** | Create venues with location, price, description |
| ✏️ **Edit Venues** | Update any venue details |
| 🗑️ **Delete Venues** | Remove venues (with confirmation) |
| 📅 **Manage Events** | Add/remove event dates for each venue |
| 👁️ **Toggle Visibility** | Mark venues active/inactive |
| 🗺️ **Set Location** | Specify lat/lng for map markers |

## 📁 Files Created

```
├── supabase/migrations/002_admin_support.sql  ← Database changes
├── src/lib/queries/admin.ts                   ← API functions
├── src/app/(app)/admin/page.tsx              ← Admin UI
├── src/components/Nav.tsx (updated)           ← Added admin link
└── Documentation/*.md                         ← Guides
```

## 🔒 Security

- ✅ Only users with `is_admin = true` can access
- ✅ Row Level Security enforced at database level
- ✅ Admin tab hidden from regular users
- ✅ All operations logged by Supabase

## 📖 Full Documentation

- **ADMIN_SUMMARY.md** - Complete overview
- **ADMIN_SETUP.md** - Detailed setup guide
- **ADMIN_QUICK_REFERENCE.md** - Daily usage guide
- **TESTING_CHECKLIST.md** - Testing procedures

## 🚀 Ready to Go!

Your admin panel is built and tested. Just apply the migration and make yourself an admin! 🎉

---

**Questions?** Check the other documentation files or open an issue.
