# 🎪 Dandiya Match

A web application for finding dandiya/garba partners at specific venues on specific nights. Built with Next.js, Supabase, and includes a full-featured admin panel for venue management.

## 🌟 Features

- **Partner Matching**: Find and connect with dance partners at specific venues
- **Privacy-First**: Contact details only revealed after mutual acceptance
- **Real-time Updates**: Live notifications for match requests
- **Admin Panel**: Complete venue and event management system
- **Secure**: Row Level Security (RLS) enforced at database level
- **Location-Based**: Interactive map showing all active venues

## 🔐 Security

Contact details are never shown until both people accept a match. This rule is enforced with Postgres Row Level Security (RLS), not only in the UI.

## 🚀 Local Setup

### Prerequisites
- Node.js 20+ and npm
- A Supabase account

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Dandia_Match
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ **Never** put the service role key in the frontend.

4. **Run the development server**
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## 📊 Supabase Setup

### 1. Create a Supabase Project
Create a new project at [supabase.com](https://supabase.com)

### 2. Run Database Migrations

**Option A: Using Supabase CLI** (Recommended)
```bash
# Link your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

**Option B: Manual SQL Execution**
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of:
   - `supabase/migrations/001_init.sql` (core schema)
   - `supabase/migrations/002_admin_support.sql` (admin features)

### 3. Enable Realtime
Go to Database → Replication and enable realtime for the `match_requests` table.

### 4. Add Venues
Use the admin panel (see Admin Setup below) or manually add venues in the table editor.

## 🔑 Google OAuth Setup

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth credentials (Web application)

2. **Configure Supabase**
   - In Supabase: Auth → Providers → Google
   - Paste the Client ID and Secret
   - Enable Google provider

3. **Add Redirect URLs**
   - In Supabase: Auth → URL Configuration
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

Signing in with Google will automatically create a profile via the `handle_new_user` trigger.

## 👑 Admin Panel Setup

The admin panel allows you to manage venues and events through a user-friendly interface.

### 1. Apply Admin Migration
Already done if you ran both migrations above.

### 2. Make Yourself Admin
In Supabase SQL Editor:
```sql
-- Find your user ID
SELECT id, display_name FROM profiles;

-- Make yourself admin (replace with your actual user ID)
UPDATE profiles SET is_admin = true WHERE id = 'your-user-id-here';
```

### 3. Access Admin Panel
- Navigate to `/admin` or click "Admin" in the navigation
- Only users with `is_admin = true` can access

### Admin Features
- ✅ **Add/Edit/Delete Venues** - Full venue management
- ✅ **Manage Events** - Add event dates with times for each venue
- ✅ **Toggle Visibility** - Mark venues active/inactive
- ✅ **Location Management** - Set coordinates for map markers
- ✅ **Quick Event Creation** - Add first event while creating venue

📚 **Detailed guides available:**
- `README_ADMIN.md` - Quick start
- `ADMIN_QUICK_REFERENCE.md` - Daily usage
- `ADMIN_SETUP.md` - Detailed setup
- `TESTING_CHECKLIST.md` - Testing procedures

## 🗑️ Account Deletion

The Profile page calls a Supabase Edge Function named `delete-account`.

**Deploy the function:**
```bash
supabase functions deploy delete-account
```

The function deletes the `auth.users` row, and related rows cascade automatically.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Maps**: Leaflet (venue location pins)
- **Backend**: Supabase
  - Authentication (Google OAuth)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Remote Procedure Calls (RPC)
  - Realtime Subscriptions
  - Edge Functions

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (app)/        # Authenticated routes
│   │   │   ├── admin/    # Admin panel
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   └── ...
│   │   ├── auth/         # Auth callbacks
│   │   └── login/
│   ├── components/       # Reusable UI components
│   ├── lib/
│   │   ├── queries/      # React Query hooks
│   │   ├── supabase/     # Supabase clients
│   │   └── types.ts      # TypeScript types
│   └── middleware.ts     # Auth middleware
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🔒 Security Features

- **Row Level Security (RLS)**: All database operations protected
- **Contact Privacy**: Phone/Instagram only visible after mutual match
- **Admin-Only Access**: Venue management restricted to admin users
- **Block System**: Users can block others from seeing their listings
- **Report System**: Users can report inappropriate behavior

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## 📝 License

MIT License - feel free to use this project for your own events!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the Dandiya/Garba community
