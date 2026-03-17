import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ListDetailView } from "@/components/ListDetailView";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="p-8">
      <ListDetailView />
    </main>
  );
}
