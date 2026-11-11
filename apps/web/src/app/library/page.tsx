import { redirect } from "next/navigation";

// Sign-in sends people to /library; the first library is Từ vựng (BR-LIB-017).
export default function LibraryIndexPage() {
  redirect("/library/vocabulary");
}
