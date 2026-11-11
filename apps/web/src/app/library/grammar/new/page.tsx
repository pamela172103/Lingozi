import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewItemPage } from "@/components/library/library-pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Library.grammar");
  return { title: t("newMetaTitle") };
}

export default function Page() {
  return <NewItemPage kind="grammar" />;
}
