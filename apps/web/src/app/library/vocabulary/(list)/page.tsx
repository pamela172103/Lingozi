import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ListPage } from "@/components/library/library-pages";
import { parsePage, parsePageSize } from "@/lib/library/paging";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Library.vocabulary");
  return { title: t("metaTitle") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const { page, pageSize } = await searchParams;
  return <ListPage kind="vocabulary" page={parsePage(page)} pageSize={parsePageSize(pageSize)} />;
}
