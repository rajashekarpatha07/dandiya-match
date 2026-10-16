"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useReportUser } from "@/lib/queries/profile";
import { rpcErrorMessage } from "@/lib/utils";

export function ReportDialog({
  reportedId,
  eventId,
  name,
  onClose,
}: {
  reportedId: string;
  eventId?: string | null;
  name: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const report = useReportUser();
  const { toast } = useToast();

  return (
    <div className="fixed inset-0 z-[2100] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="report-title"
        className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl"
      >
        <h2 id="report-title" className="font-display text-xl">
          Report {name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          This is sent to the app owner. They review reports in the dashboard.
        </p>
        <textarea
          className="mt-4 min-h-28 w-full rounded-xl border border-line bg-cream p-3 text-sm"
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What happened?"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={!reason.trim() || report.isPending}
            onClick={async () => {
              try {
                await report.mutateAsync({
                  reportedId,
                  reason: reason.trim(),
                  eventId,
                });
                toast("Report submitted", "success");
                onClose();
              } catch (err) {
                toast(rpcErrorMessage(err), "error");
              }
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
