import { DetailPage } from "@/components/library/library-pages";

export const dynamic = "force-dynamic";

// ?saved=create (or the old ?saved=1) shows "Đã lưu"; ?saved=edit shows "Đã lưu thay đổi".
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const flag = saved === "1" || saved === "create" ? "create" : saved === "edit" ? "edit" : null;
  return <DetailPage kind="grammar" id={id} saved={flag} />;
}
