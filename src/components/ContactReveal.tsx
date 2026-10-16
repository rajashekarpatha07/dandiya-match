"use client";

import { PageSpinner } from "@/components/Spinner";
import { ErrorState } from "@/components/EmptyState";
import { useMatchedContact } from "@/lib/queries/profile";
import { instagramLink, whatsappLink } from "@/lib/utils";

export function ContactReveal({
  otherUserId,
  otherName,
}: {
  otherUserId: string;
  otherName: string;
}) {
  const { data, isLoading, isError, refetch } = useMatchedContact(otherUserId);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data || (!data.phone && !data.instagram)) {
    return (
      <p className="text-sm text-muted">
        {otherName} hasn&apos;t added contact details yet.
      </p>
    );
  }

  const wa = data.phone ? whatsappLink(data.phone) : null;
  const ig = data.instagram ? instagramLink(data.instagram) : null;

  return (
    <div className="rounded-xl border border-gold bg-gold/15 p-3">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        Contact (shared after match)
      </p>
      {data.phone ? (
        <p className="mt-2 text-sm">
          Phone: {data.phone}
          {wa ? (
            <>
              {" "}
              ·{" "}
              <a
                className="font-semibold text-orange underline"
                href={wa}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {data.instagram ? (
        <p className="mt-1 text-sm">
          Instagram: {data.instagram}
          {ig ? (
            <>
              {" "}
              ·{" "}
              <a
                className="font-semibold text-orange underline"
                href={ig}
                target="_blank"
                rel="noreferrer"
              >
                Open Instagram
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
