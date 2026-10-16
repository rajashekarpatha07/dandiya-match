"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { PageSpinner } from "@/components/Spinner";
import { VenueMapLoader } from "@/components/VenueMapLoader";
import { useVenues } from "@/lib/queries/venues";
import { formatEventDate } from "@/lib/date";
import { formatEntryFee } from "@/lib/utils";

export default function MapHomePage() {
  const { data: venues, isLoading, isError, refetch } = useVenues();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter venues based on search query
  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    if (!searchQuery.trim()) return venues;

    const query = searchQuery.toLowerCase();
    return venues.filter((venue) => {
      return (
        venue.name.toLowerCase().includes(query) ||
        venue.area?.toLowerCase().includes(query) ||
        venue.address?.toLowerCase().includes(query) ||
        venue.description?.toLowerCase().includes(query)
      );
    });
  }, [venues, searchQuery]);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const list = venues ?? [];
  const displayList = filteredVenues;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row">
      <div className="relative min-h-[48%] flex-1">
        <VenueMapLoader venues={displayList} />
      </div>
      <aside className="max-h-[52%] overflow-y-auto border-t border-line bg-cream md:max-h-none md:w-80 md:border-t-0 md:border-l">
        <div className="sticky top-0 z-10 bg-cream px-4 py-3 shadow-sm">
          <h1 className="font-display text-xl text-red">Venues in Kamareddy</h1>
          <p className="text-xs text-muted">
            {displayList.length} {displayList.length === 1 ? "venue" : "venues"}
            {searchQuery && ` found`}
          </p>
          
          {/* Search Bar */}
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Search venues, areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-line bg-white px-4 py-2 pl-10 text-sm focus:border-orange focus:outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {list.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No venues yet"
              body="The owner adds venues in the Supabase table editor."
            />
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No results found"
              body={`No venues match "${searchQuery}". Try a different search.`}
            />
          </div>
        ) : (
          <ul className="space-y-2 px-3 pb-4">
            {displayList.map((venue) => (
              <li key={venue.id}>
                <Link
                  href={`/venue/${venue.id}`}
                  className="block min-h-11 rounded-2xl border border-line bg-card p-3"
                >
                  <p className="font-semibold">{venue.name}</p>
                  <p className="text-xs text-muted">
                    {venue.area || venue.address} · {formatEntryFee(venue.entry_fee)}
                  </p>
                  {venue.nextEvent ? (
                    <p className="mt-1 text-xs text-orange">
                      Next: {formatEventDate(venue.nextEvent.event_date)}
                      {venue.openListingCount
                        ? ` · ${venue.openListingCount} looking`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted">No upcoming dates</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
