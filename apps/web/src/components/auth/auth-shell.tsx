import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

/**
 * Frame of the sign-in pages (Figma frames W-AUTH-01…05): centred logo, card, legal footer.
 * Sign-in pages never follow the user's theme, so the default theme is pinned here (design-system §2).
 */
export async function AuthShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("Auth.footer");
  return (
    <div
      data-theme="default"
      className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10 text-primary"
    >
      <div className="w-full max-w-[440px]">
        <p className="mb-5 text-center text-xl font-semibold text-accent-text">Lingozi</p>
        <main className="rounded-card bg-surface p-6 shadow-card sm:p-8">{children}</main>
        {/* Legal pages arrive with US-AUTH-10; until then the footer is text, not dead links. */}
        <p className="mt-6 text-center text-xs text-muted">
          {t("privacy")} · {t("dataDeletion")}
        </p>
      </div>
    </div>
  );
}
