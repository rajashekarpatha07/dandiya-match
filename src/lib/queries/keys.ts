export const queryKeys = {
  me: ["me"] as const,
  profile: (id: string) => ["profile", id] as const,
  contacts: (id: string) => ["contacts", id] as const,
  venues: ["venues"] as const,
  venue: (id: string) => ["venue", id] as const,
  venueEvents: (venueId: string) => ["venue-events", venueId] as const,
  event: (id: string) => ["event", id] as const,
  listings: (eventId: string) => ["listings", eventId] as const,
  myListing: (eventId: string) => ["my-listing", eventId] as const,
  sentRequests: ["requests", "sent"] as const,
  receivedRequests: ["requests", "received"] as const,
  matchedRequests: ["requests", "matched"] as const,
  eventSentRequests: (eventId: string) =>
    ["requests", "sent", eventId] as const,
  blocks: ["blocks"] as const,
  pendingReceivedCount: ["requests", "received", "pending-count"] as const,
};
