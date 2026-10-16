"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ReportDialog } from "@/components/ReportDialog";
import { useToast } from "@/components/Toast";
import { useBlockUser } from "@/lib/queries/profile";
import { experienceLabel, genderLabel, rpcErrorMessage } from "@/lib/utils";
import type { ListingWithProfile } from "@/lib/types";

export function ListingCard({
  listing,
  eventId,
  canRequest,
  alreadyRequested,
  onSendRequest,
}: {
  listing: ListingWithProfile;
  eventId: string;
  canRequest: boolean;
  alreadyRequested: boolean;
  onSendRequest: () => void;
}) {
  const profile = listing.profile;
  const name = profile?.display_name ?? "Dandiya Fan";
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const block = useBlockUser();
  const { toast } = useToast();

  return (
    <article className="relative rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar name={name} src={profile?.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate font-semibold">{name}</h3>
              <p className="text-xs text-muted">
                {profile?.age ? `${profile.age} · ` : ""}
                {genderLabel(profile?.gender)} ·{" "}
                {experienceLabel(profile?.experience)}
              </p>
            </div>
            <button
              type="button"
              aria-label="More actions"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-lg"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋯
            </button>
          </div>
          {listing.note ? (
            <p className="mt-2 text-sm text-ink">{listing.note}</p>
          ) : null}
          {profile?.bio ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{profile.bio}</p>
          ) : null}
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={!canRequest || alreadyRequested}
        onClick={onSendRequest}
      >
        {alreadyRequested ? "Request sent" : "Send request"}
      </Button>
      {menuOpen ? (
        <div className="absolute top-14 right-3 z-10 w-40 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          <button
            type="button"
            className="flex min-h-11 w-full items-center px-3 text-left text-sm"
            onClick={async () => {
              try {
                await block.mutateAsync(listing.user_id);
                toast("User blocked", "success");
                setMenuOpen(false);
              } catch (err) {
                toast(rpcErrorMessage(err), "error");
              }
            }}
          >
            Block
          </button>
          <button
            type="button"
            className="flex min-h-11 w-full items-center px-3 text-left text-sm text-red"
            onClick={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
          >
            Report
          </button>
        </div>
      ) : null}
      {reportOpen ? (
        <ReportDialog
          reportedId={listing.user_id}
          eventId={eventId}
          name={name}
          onClose={() => setReportOpen(false)}
        />
      ) : null}
    </article>
  );
}
