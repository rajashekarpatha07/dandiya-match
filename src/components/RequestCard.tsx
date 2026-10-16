"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ContactReveal } from "@/components/ContactReveal";
import { ReportDialog } from "@/components/ReportDialog";
import { useToast } from "@/components/Toast";
import { formatEventDate } from "@/lib/date";
import {
  useCancelRequest,
  useRespondToRequest,
  useUnmatch,
} from "@/lib/queries/requests";
import { useBlockUser, useCurrentUser } from "@/lib/queries/profile";
import { experienceLabel, rpcErrorMessage } from "@/lib/utils";
import type { RequestWithDetails } from "@/lib/types";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-gold/30 text-ink",
    accepted: "bg-orange/15 text-orange-deep",
    rejected: "bg-red/10 text-red",
    cancelled: "bg-line text-muted",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] ?? "bg-line"}`}
    >
      {status}
    </span>
  );
}

export function RequestCard({
  request,
  variant,
}: {
  request: RequestWithDetails;
  variant: "received" | "sent" | "matched";
}) {
  const { data: user } = useCurrentUser();
  const other =
    user?.id === request.sender_id ? request.receiver : request.sender;
  const name = other?.display_name ?? "Dandiya Fan";
  const venue = request.event?.venue?.name;
  const date = request.event?.event_date
    ? formatEventDate(request.event.event_date)
    : "";
  const respond = useRespondToRequest();
  const cancel = useCancelRequest();
  const unmatchMut = useUnmatch();
  const block = useBlockUser();
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);

  async function run(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn();
      toast(ok, "success");
    } catch (err) {
      toast(rpcErrorMessage(err), "error");
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <div className="flex gap-3">
        <Avatar name={name} src={other?.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-xs text-muted">
                {other?.age ? `${other.age} · ` : ""}
                {experienceLabel(other?.experience)}
              </p>
            </div>
            {statusBadge(request.status)}
          </div>
          <p className="mt-1 text-sm text-muted">
            {venue}
            {date ? ` · ${date}` : ""}
          </p>
          {request.message ? (
            <p className="mt-2 text-sm">{request.message}</p>
          ) : null}
        </div>
      </div>

      {variant === "matched" && other ? (
        <div className="mt-3">
          <ContactReveal otherUserId={other.id} otherName={name} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {variant === "received" && request.status === "pending" ? (
          <>
            <Button
              className="flex-1"
              disabled={respond.isPending}
              onClick={() =>
                run(
                  () =>
                    respond.mutateAsync({
                      requestId: request.id,
                      accept: true,
                    }),
                  "Match accepted",
                )
              }
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={respond.isPending}
              onClick={() =>
                run(
                  () =>
                    respond.mutateAsync({
                      requestId: request.id,
                      accept: false,
                    }),
                  "Request declined",
                )
              }
            >
              Decline
            </Button>
          </>
        ) : null}
        {variant === "sent" && request.status === "pending" ? (
          <Button
            variant="secondary"
            disabled={cancel.isPending}
            onClick={() =>
              run(() => cancel.mutateAsync(request.id), "Request cancelled")
            }
          >
            Cancel
          </Button>
        ) : null}
        {variant === "matched" ? (
          <Button
            variant="danger"
            disabled={unmatchMut.isPending}
            onClick={() => {
              if (
                confirm(
                  "Unmatch? Listings will reopen and contact details will be hidden.",
                )
              ) {
                void run(
                  () => unmatchMut.mutateAsync(request.id),
                  "Unmatched",
                );
              }
            }}
          >
            Unmatch
          </Button>
        ) : null}
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await block.mutateAsync(other!.id);
              toast("User blocked", "success");
            } catch (err) {
              toast(rpcErrorMessage(err), "error");
            }
          }}
        >
          Block
        </Button>
        <Button variant="ghost" onClick={() => setReportOpen(true)}>
          Report
        </Button>
      </div>
      {reportOpen && other ? (
        <ReportDialog
          reportedId={other.id}
          eventId={request.event_id}
          name={name}
          onClose={() => setReportOpen(false)}
        />
      ) : null}
    </article>
  );
}
