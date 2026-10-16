"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { SafetyTip } from "@/components/SafetyTip";
import { PageSpinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { formatEventDate } from "@/lib/date";
import {
  useEventListings,
  useMyListing,
  useUpdateListingStatus,
  useUpsertListing,
} from "@/lib/queries/listings";
import { useEventSentRequests, useSendRequest } from "@/lib/queries/requests";
import { useEvent } from "@/lib/queries/venues";
import { todayIST } from "@/lib/date";
import type { Experience, Gender, PreferredGender } from "@/lib/types";
import { rpcErrorMessage } from "@/lib/utils";

export default function EventPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const eventQ = useEvent(eventId);
  const listingsQ = useEventListings(eventId);
  const myListingQ = useMyListing(eventId);
  const sentQ = useEventSentRequests(eventId);
  const [gender, setGender] = useState<"all" | Gender>("all");
  const [experience, setExperience] = useState<"all" | Experience>("all");
  const [requestFor, setRequestFor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const event = eventQ.data;
  const past = event ? event.event_date < todayIST() : false;

  const filtered = useMemo(() => {
    return (listingsQ.data ?? []).filter((l) => {
      if (gender !== "all" && l.profile?.gender !== gender) return false;
      if (experience !== "all" && l.profile?.experience !== experience)
        return false;
      return true;
    });
  }, [listingsQ.data, gender, experience]);

  const sentByReceiver = new Map(
    (sentQ.data ?? []).map((r) => [r.receiver_id, r]),
  );
  const myListing = myListingQ.data;
  const canRequest = myListing?.status === "open" && !past;

  if (eventQ.isLoading) return <PageSpinner />;
  if (eventQ.isError) return <ErrorState onRetry={() => void eventQ.refetch()} />;
  if (!event) {
    return (
      <main className="mx-auto max-w-lg p-5">
        <EmptyState title="Event not found" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-5">
      <Link
        href={`/venue/${event.venue_id}`}
        className="text-sm font-semibold text-orange"
      >
        ← {event.venue?.name ?? "Venue"}
      </Link>
      <h1 className="font-display mt-3 text-3xl text-red">
        {event.venue?.name}
      </h1>
      <p className="text-muted">{formatEventDate(event.event_date)}</p>
      <div className="mt-4">
        <SafetyTip />
      </div>

      {past ? (
        <p className="mt-4 text-sm text-muted">This night has already passed.</p>
      ) : (
        <MyListingPanel eventId={eventId} />
      )}

      <div className="mt-8 flex gap-2">
        <select
          className="min-h-11 flex-1 rounded-xl border border-line bg-card px-3 text-sm"
          value={gender}
          onChange={(e) => setGender(e.target.value as typeof gender)}
        >
          <option value="all">All genders</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <select
          className="min-h-11 flex-1 rounded-xl border border-line bg-card px-3 text-sm"
          value={experience}
          onChange={(e) => setExperience(e.target.value as typeof experience)}
        >
          <option value="all">All experience</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      <h2 className="font-display mt-6 text-xl">People looking</h2>
      {listingsQ.isLoading ? (
        <PageSpinner />
      ) : listingsQ.isError ? (
        <ErrorState onRetry={() => void listingsQ.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No listings yet"
          body="Post yours so others can find you."
        />
      ) : (
        <div className="mt-3 grid gap-3">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              eventId={eventId}
              canRequest={canRequest}
              alreadyRequested={sentByReceiver.has(listing.user_id)}
              onSendRequest={() =>
                setRequestFor({
                  id: listing.user_id,
                  name: listing.profile?.display_name ?? "this person",
                })
              }
            />
          ))}
        </div>
      )}

      {requestFor ? (
        <SendRequestDialog
          eventId={eventId}
          receiverId={requestFor.id}
          name={requestFor.name}
          onClose={() => setRequestFor(null)}
        />
      ) : null}
    </main>
  );
}

function MyListingPanel({ eventId }: { eventId: string }) {
  const { data: listing, isLoading } = useMyListing(eventId);
  const upsert = useUpsertListing(eventId);
  const updateStatus = useUpdateListingStatus(eventId);
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [preferred, setPreferred] = useState<PreferredGender>("any");

  if (isLoading) return <PageSpinner />;

  if (listing && listing.status !== "closed") {
    return (
      <section className="mt-5 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm font-semibold capitalize">
          Your listing: {listing.status}
        </p>
        {listing.note ? (
          <p className="mt-1 text-sm text-muted">{listing.note}</p>
        ) : null}
        {listing.status === "open" ? (
          <Button
            variant="secondary"
            className="mt-3"
            disabled={updateStatus.isPending}
            onClick={async () => {
              try {
                await updateStatus.mutateAsync("closed");
                toast("Listing closed", "success");
              } catch (err) {
                toast(rpcErrorMessage(err), "error");
              }
            }}
          >
            Close listing
          </Button>
        ) : (
          <p className="mt-2 text-sm text-muted">
            You&apos;re matched for this night.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-line bg-card p-4">
      <h2 className="font-semibold">
        {listing?.status === "closed" ? "Reopen your listing" : "Post my listing"}
      </h2>
      <p className="mt-1 text-xs text-muted">
        You need an open listing before you can send requests.
      </p>
      <textarea
        maxLength={200}
        className="mt-3 min-h-20 w-full rounded-xl border border-line bg-cream p-3 text-sm"
        placeholder="Optional note (what you're looking for)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <label className="mt-3 block text-sm">
        Preferred partner
        <select
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-cream px-3"
          value={preferred}
          onChange={(e) => setPreferred(e.target.value as PreferredGender)}
        >
          <option value="any">Any</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </label>
      <Button
        className="mt-3 w-full"
        disabled={upsert.isPending}
        onClick={async () => {
          try {
            await upsert.mutateAsync({
              note,
              preferred_gender: preferred,
            });
            toast("Listing posted", "success");
          } catch (err) {
            toast(rpcErrorMessage(err), "error");
          }
        }}
      >
        {listing?.status === "closed" ? "Reopen listing" : "Post listing"}
      </Button>
    </section>
  );
}

function SendRequestDialog({
  eventId,
  receiverId,
  name,
  onClose,
}: {
  eventId: string;
  receiverId: string;
  name: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const send = useSendRequest();
  const { toast } = useToast();

  return (
    <div className="fixed inset-0 z-[2100] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl"
      >
        <h2 className="font-display text-xl">Request {name}</h2>
        <textarea
          maxLength={200}
          className="mt-3 min-h-24 w-full rounded-xl border border-line bg-cream p-3 text-sm"
          placeholder="Optional message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={send.isPending}
            onClick={async () => {
              try {
                await send.mutateAsync({
                  eventId,
                  receiverId,
                  message: message.trim() || undefined,
                });
                toast("Request sent", "success");
                onClose();
              } catch (err) {
                const msg = rpcErrorMessage(err);
                if (/duplicate|unique/i.test(msg)) {
                  toast("You already sent a request to this person", "error");
                } else {
                  toast(msg, "error");
                }
              }
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
