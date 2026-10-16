"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { RequestCard } from "@/components/RequestCard";
import { SafetyTip } from "@/components/SafetyTip";
import { PageSpinner } from "@/components/Spinner";
import {
  useMatchedRequests,
  useReceivedRequests,
  useSentRequests,
} from "@/lib/queries/requests";
import { cn } from "@/lib/utils";

type Tab = "received" | "sent" | "matched";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("received");
  const received = useReceivedRequests();
  const sent = useSentRequests();
  const matched = useMatchedRequests();

  const receivedSorted = useMemo(() => {
    const rows = received.data ?? [];
    return [...rows].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [received.data]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-5">
      <h1 className="font-display text-3xl text-red">Requests</h1>
      <div className="mt-3">
        <SafetyTip />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-full border border-line bg-card p-1">
        {(
          [
            ["received", "Received"],
            ["sent", "Sent"],
            ["matched", "Matched"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "min-h-11 rounded-full text-sm font-semibold",
              tab === id ? "bg-orange text-white" : "text-muted",
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {tab === "received" ? (
          <List
            loading={received.isLoading}
            error={received.isError}
            retry={() => void received.refetch()}
            emptyTitle="No received requests"
            emptyBody="When someone wants to partner with you, it shows up here."
          >
            {receivedSorted.map((r) => (
              <RequestCard key={r.id} request={r} variant="received" />
            ))}
          </List>
        ) : null}
        {tab === "sent" ? (
          <List
            loading={sent.isLoading}
            error={sent.isError}
            retry={() => void sent.refetch()}
            emptyTitle="No sent requests"
            emptyBody="Open an event and send a request from someone's listing."
          >
            {(sent.data ?? []).map((r) => (
              <RequestCard key={r.id} request={r} variant="sent" />
            ))}
          </List>
        ) : null}
        {tab === "matched" ? (
          <List
            loading={matched.isLoading}
            error={matched.isError}
            retry={() => void matched.refetch()}
            emptyTitle="No matches yet"
            emptyBody="Accepted requests appear here with contact details."
          >
            {(matched.data ?? []).map((r) => (
              <RequestCard key={r.id} request={r} variant="matched" />
            ))}
          </List>
        ) : null}
      </div>
    </main>
  );
}

function List({
  loading,
  error,
  retry,
  emptyTitle,
  emptyBody,
  children,
}: {
  loading: boolean;
  error: boolean;
  retry: () => void;
  emptyTitle: string;
  emptyBody: string;
  children: React.ReactNode;
}) {
  if (loading) return <PageSpinner />;
  if (error) return <ErrorState onRetry={retry} />;
  const items = Array.isArray(children) ? children : [children];
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }
  return <>{children}</>;
}
