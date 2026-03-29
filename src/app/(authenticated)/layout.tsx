import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { listService } from "@/services";
import { redirect } from "next/navigation";
import { createDefaultData } from "../actions/onboarding";
import { UnauthorizedError } from "@/lib/errors";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !session.user?.id) {
    redirect("/");
  }

  let lists = await listService.getAll(session.user.id);
  
  if (lists.length === 0) {
      try {
        await createDefaultData();
        // revalidatePath is not allowed during render.
        // We will fetch the data again to ensure the UI is updated immediately.
        lists = await listService.getAll(session.user.id);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          // Properly clear the session, then redirect.
          redirect("/api/auth/logout");
        }
        // Error will propagate to error.tsx
        throw error;
      }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar lists={lists} />
      <main className="flex-1 overflow-y-auto bg-bg text-text p-6">
        {children}
      </main>
    </div>
  );
}
