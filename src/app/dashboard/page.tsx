import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ListDetailView } from "@/components/ListDetailView";
import { Sidebar } from "@/components/Sidebar";
import { listService } from "@/services/list.service";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  let lists = await listService.getAll(session.user.id);

  if (lists.length === 0) {
    // Onboarding: create default list
    await listService.create(session.user.id, {
      name: "My First List",
      category: "General",
    });
    lists = await listService.getAll(session.user.id);
  }

  return (
    <div className="dashboard-container">
      <Sidebar lists={lists} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ListDetailView />
      </main>
    </div>
  );
}
