import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { CodeEntry } from "@/components/auth/code-entry";
import { remainingCodeSeconds } from "@/lib/auth/code-timing";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.code");
  return { title: t("metaTitle") };
}

export const dynamic = "force-dynamic";

export default async function CodePage({ searchParams }: { searchParams: Promise<{ email?: string; sent?: string }> }) {
  const { email, sent } = await searchParams;
  // Without a valid email there is no code to enter: go back to the start (SRS routes table).
  if (!email || !isValidEmail(email)) redirect("/auth/login");

  const remaining = remainingCodeSeconds(Number.parseInt(sent ?? "", 10));

  return (
    <AuthShell>
      <CodeEntry email={normalizeEmail(email)} initialRemainingSeconds={remaining} />
    </AuthShell>
  );
}
