import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ListPage } from "@/components/library/library-pages";
import { parseNotice, parsePage, parsePageSize } from "@/lib/library/paging";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Library.grammar");
  return { title: t("metaTitle") };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; notice?: string }>;
}) {
  const { page, pageSize, notice } = await searchParams;
  return (
    <ListPage kind="grammar" page={parsePage(page)} pageSize={parsePageSize(pageSize)} notice={parseNotice(notice)} />
  );
}
