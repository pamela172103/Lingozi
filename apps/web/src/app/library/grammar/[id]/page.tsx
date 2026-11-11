import { DetailPage } from "@/components/library/library-pages";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  return <DetailPage kind="grammar" id={id} saved={saved === "1"} />;
}
