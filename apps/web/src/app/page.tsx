import { getFormatter, getTranslations } from "next-intl/server";

import { SystemStatusPanel } from "@/components/system-status-panel";
import { fetchSystemStatus } from "@/lib/system-status";

// Always render on request: the page shows live API/database state.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [t, format, result] = await Promise.all([getTranslations("SystemStatus"), getFormatter(), fetchSystemStatus()]);

  const keys = [
    "heading",
    "intro",
    "api",
    "database",
    "migrations",
    "checkedAt",
    "ok",
    "unavailable",
    "apiUnreachable",
    "unknown",
  ] as const;
  const labels = Object.fromEntries(keys.map((key) => [key, t(key)])) as Record<(typeof keys)[number], string>;

  return (
    <main className="mx-auto max-w-[1120px] px-4 py-12 sm:px-8">
      <SystemStatusPanel
        result={result}
        labels={labels}
        formatTime={(iso) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "medium" })}
      />
    </main>
  );
}
