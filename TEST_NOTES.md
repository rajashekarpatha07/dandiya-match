# Test notes (sections 11 and 12)

Run these after the migration is applied, Google OAuth works, and at least one venue + `venue_events` row exists. Use two Google accounts (A and B).

## Section 11 — build phases

### Phase 1
- Sign in with Google.
- Confirm a `profiles` row is created for that `auth.users` id (`display_name` from Google `full_name` when present).

### Phase 2
- Logged-out visit to `/`, `/dashboard`, `/profile`, `/venue/...` redirects to `/login`.
- New user after OAuth is sent to `/onboarding` and cannot use the map until `onboarded = true`.
- Returning onboarded user lands on the map (`/`).
- `/terms` and `/privacy` stay public.

### Phase 3
- Every `venues` row with `is_active = true` appears as a map pin (Hyderabad, zoom 11).
- Popup shows name, area, fee, and View.
- View and the side/bottom list open `/venue/[venueId]`.
- Upcoming dates only (`event_date >= today` IST). Selecting a date opens `/event/[eventId]`.
- Check layout at 375px width.

### Phase 4
- User without a listing sees “Post my listing”. After posting, they can send requests.
- A can send a request to B via `send_request` (not a direct insert).
- A sixth pending request for the same event shows: `You can have at most 5 pending requests per event`.
- A second request to the same person for the same event is blocked (unique constraint); UI shows a friendly toast.
- RPC errors surface as toasts.

### Phase 5
- Dashboard tabs: Received (pending first, Accept/Decline), Sent (Cancel on pending), Matched (contacts + Unmatch).
- Before accept: as A, `from('profile_contacts').select('*').eq('user_id', B)` returns no row.
- After B accepts: both see phone/Instagram (WhatsApp + Instagram links).
- Unmatch reopens both listings and contacts disappear again.
- Accepting one request auto-cancels other pending requests involving either person for that event.

### Phase 6
- Block/Report on listing and request cards. Blocked user’s listing disappears from the blocker’s event list.
- Received badge on nav updates without refresh (Realtime on `match_requests`).
- Profile edit, blocked list + unblock, Delete my account (needs Edge Function), Terms/Privacy.
- Empty, loading, and error states on lists.

## Section 12 — security (JWT or two logged-in browsers)

1. A cannot `select` B’s `profile_contacts` with no accepted request.
2. A cannot `insert` / `update` / `delete` `match_requests` (no client write policies).
3. A cannot `respond_to_request` on a request where A is the sender (`Only the receiver can respond`).
4. A cannot accept a request that is already rejected/cancelled (`Request is no longer pending`).
5. A cannot read another user’s listing unless it is `open` (and not blocked).
6. An anonymous client cannot read tables or execute RPCs (`anon` has no grants/policies that allow it).
7. A cannot update B’s profile (`profiles update own`).

Client UI never writes `match_requests` except through `src/lib/rpc.ts`.
