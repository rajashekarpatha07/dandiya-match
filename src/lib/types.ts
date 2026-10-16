export type Gender = "male" | "female" | "other";
export type Experience = "beginner" | "intermediate" | "pro";
export type PreferredGender = "any" | "male" | "female";
export type ListingStatus = "open" | "matched" | "closed";
export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  gender: Gender | null;
  age: number | null;
  experience: Experience | null;
  bio: string | null;
  onboarded: boolean;
  created_at: string;
};

export type ProfileContact = {
  user_id: string;
  phone: string | null;
  instagram: string | null;
  updated_at: string;
};

export type Venue = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  area: string | null;
  lat: number;
  lng: number;
  entry_fee: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type VenueEvent = {
  id: string;
  venue_id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
};

export type PartnerListing = {
  id: string;
  user_id: string;
  event_id: string;
  note: string | null;
  preferred_gender: PreferredGender;
  status: ListingStatus;
  created_at: string;
};

export type MatchRequest = {
  id: string;
  event_id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  responded_at: string | null;
};

export type Block = {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export type PublicProfile = Pick<
  Profile,
  "id" | "display_name" | "avatar_url" | "age" | "gender" | "experience" | "bio"
>;

export type ListingWithProfile = PartnerListing & {
  profile: PublicProfile | null;
};

export type EventWithVenue = VenueEvent & {
  venue: Venue | null;
};

export type RequestWithDetails = MatchRequest & {
  sender?: PublicProfile | null;
  receiver?: PublicProfile | null;
  event?: EventWithVenue | null;
};

export type VenueWithStats = Venue & {
  nextEvent: VenueEvent | null;
  openListingCount: number;
};
