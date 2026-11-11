import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ListPage } from "@/components/library/library-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Library.vocabulary");
  return { title: t("metaTitle") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const parsed = Number.parseInt(page ?? "1", 10);
  return <ListPage kind="vocabulary" page={Number.isFinite(parsed) && parsed >= 1 ? parsed : 1} />;
}
