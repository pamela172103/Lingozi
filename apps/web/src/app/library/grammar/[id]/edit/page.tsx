import { EditItemPage } from "@/components/library/library-pages";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditItemPage kind="grammar" id={id} />;
}
