"use client";

import Link from "next/link";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { PageSpinner } from "@/components/Spinner";
import { VenueMapLoader } from "@/components/VenueMapLoader";
import { useVenues } from "@/lib/queries/venues";
import { formatEventDate } from "@/lib/date";
import { formatEntryFee } from "@/lib/utils";

export default function MapHomePage() {
  const { data: venues, isLoading, isError, refetch } = useVenues();

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const list = venues ?? [];

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row">
      <div className="relative min-h-[48%] flex-1">
        <VenueMapLoader venues={list} />
      </div>
      <aside className="max-h-[52%] overflow-y-auto border-t border-line bg-cream md:max-h-none md:w-80 md:border-t-0 md:border-l">
        <div className="sticky top-0 bg-cream px-4 py-3">
          <h1 className="font-display text-xl text-red">Venues in Kamareddy</h1>
          <p className="text-xs text-muted">{list.length} active venues</p>
        </div>
        {list.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No venues yet"
              body="The owner adds venues in the Supabase table editor."
            />
          </div>
        ) : (
          <ul className="space-y-2 px-3 pb-4">
            {list.map((venue) => (
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
