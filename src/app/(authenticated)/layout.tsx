import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { listService } from "@/services";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !session.user?.id) {
    redirect("/");
  }

  const lists = await listService.getAll(session.user.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar lists={lists} />
      <main className="flex-1 overflow-y-auto bg-bg text-text p-6">
        {children}
      </main>
    </div>
  );
}
