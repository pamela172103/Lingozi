import { getTranslations } from "next-intl/server";

// Placeholder only: the library itself is FEAT-02 (not built yet). The session cookie is already issued by US-AUTH-02.
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const t = await getTranslations("Library");
  return (
    <main className="mx-auto max-w-[720px] px-4 py-12">
      <h1 className="text-2xl font-semibold text-primary">{t("title")}</h1>
      <p className="mt-4 text-secondary">{t("placeholder")}</p>
    </main>
  );
}
