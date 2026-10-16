export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card px-5 py-10 text-center">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {body ? <p className="mt-2 text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red/30 bg-card px-5 py-8 text-center">
      <p className="text-sm text-red">{message || "Could not load this."}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-11 rounded-full bg-red px-4 text-sm font-medium text-white"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
