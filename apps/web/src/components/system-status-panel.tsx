import type { SystemStatusResult } from "@/lib/system-status";

export type SystemStatusLabels = {
  heading: string;
  intro: string;
  api: string;
  database: string;
  migrations: string;
  checkedAt: string;
  ok: string;
  unavailable: string;
  apiUnreachable: string;
  unknown: string;
};

type Props = { result: SystemStatusResult; labels: SystemStatusLabels; formatTime: (iso: string) => string };

function StatusValue({ healthy, okLabel, badLabel }: { healthy: boolean; okLabel: string; badLabel: string }) {
  // Status is conveyed by icon + text, never by colour alone (design-system §3.1).
  return healthy ? (
    <span className="font-medium text-success">
      <span aria-hidden="true">✓ </span>
      {okLabel}
    </span>
  ) : (
    <span className="font-medium text-danger">
      <span aria-hidden="true">✗ </span>
      {badLabel}
    </span>
  );
}

export function SystemStatusPanel({ result, labels, formatTime }: Props) {
  return (
    <section aria-labelledby="system-status-heading" className="rounded-card bg-surface p-6 shadow-card">
      <h1 id="system-status-heading" className="text-2xl font-semibold text-primary">
        {labels.heading}
      </h1>
      <p className="mt-2 text-secondary">{labels.intro}</p>

      {result.kind === "api-unreachable" ? (
        <p role="alert" className="mt-6 text-danger">
          <span aria-hidden="true">✗ </span>
          {labels.apiUnreachable}
        </p>
      ) : (
        <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
          <dt className="text-secondary">{labels.api}</dt>
          <dd>
            <StatusValue healthy okLabel={labels.ok} badLabel={labels.unavailable} />
          </dd>
          <dt className="text-secondary">{labels.database}</dt>
          <dd data-testid="database-status">
            <StatusValue healthy={result.status.database === "ok"} okLabel={labels.ok} badLabel={labels.unavailable} />
          </dd>
          <dt className="text-secondary">{labels.migrations}</dt>
          <dd className="text-primary">{result.status.pendingMigrations ?? labels.unknown}</dd>
          <dt className="text-secondary">{labels.checkedAt}</dt>
          <dd className="text-muted">
            <time dateTime={result.status.checkedAt}>{formatTime(result.status.checkedAt)}</time>
          </dd>
        </dl>
      )}
    </section>
  );
}
