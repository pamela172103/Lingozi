import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.login");
  return { title: t("metaTitle") };
}

// External provider buttons appear once US-AUTH-04/05 exist and the provider is configured (SRS W-AUTH-01).
function configuredProviders(): Array<"google" | "facebook"> {
  const enabled = (process.env.AUTH_EXTERNAL_PROVIDERS ?? "").split(",").map((p) => p.trim());
  return (["google", "facebook"] as const).filter((p) => enabled.includes(p));
}

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm providers={configuredProviders()} />
    </AuthShell>
  );
}
