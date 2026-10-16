"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { PageSpinner } from "@/components/Spinner";
import { formatEventDate, formatTime } from "@/lib/date";
import { useVenue, useVenueEvents } from "@/lib/queries/venues";
import { formatEntryFee } from "@/lib/utils";

export default function VenueDetailPage() {
  const params = useParams<{ venueId: string }>();
  const venueId = params.venueId;
  const venueQ = useVenue(venueId);
  const eventsQ = useVenueEvents(venueId);

  if (venueQ.isLoading || eventsQ.isLoading) return <PageSpinner />;
  if (venueQ.isError) return <ErrorState onRetry={() => void venueQ.refetch()} />;
  if (!venueQ.data) {
    return (
      <main className="mx-auto max-w-lg p-5">
        <EmptyState title="Venue not found" />
      </main>
    );
  }

  const venue = venueQ.data;
  const events = eventsQ.data ?? [];

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-5">
      <Link href="/" className="text-sm font-semibold text-orange">
        ← Map
      </Link>
      <h1 className="font-display mt-3 text-3xl text-red">{venue.name}</h1>
      {venue.area ? <p className="text-muted">{venue.area}</p> : null}
      {venue.address ? <p className="mt-1 text-sm">{venue.address}</p> : null}
      <p className="mt-2 text-sm font-medium">{formatEntryFee(venue.entry_fee)}</p>
      {venue.description ? (
        <p className="mt-4 text-sm leading-6">{venue.description}</p>
      ) : null}

      <h2 className="font-display mt-8 text-xl">Upcoming nights</h2>
      {eventsQ.isError ? (
        <ErrorState onRetry={() => void eventsQ.refetch()} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No upcoming dates"
          body="Past nights are hidden. Check back when the owner adds dates."
        />
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/event/${event.id}`}
                className="flex min-h-11 items-center justify-between rounded-2xl border border-line bg-card px-4 py-3"
              >
                <span>
                  <span className="block font-semibold">
                    {formatEventDate(event.event_date)}
                  </span>
                  {(event.start_time || event.end_time) && (
                    <span className="text-xs text-muted">
                      {formatTime(event.start_time) ?? ""}
                      {event.end_time
                        ? ` – ${formatTime(event.end_time)}`
                        : ""}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-orange">
                  Find a partner
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
