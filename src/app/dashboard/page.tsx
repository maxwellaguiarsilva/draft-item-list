import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listService } from "@/services";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  const lists = await listService.getAll(session.user.id);

  return (
    <main>
      <h1>My Lists</h1>
      {lists.length === 0 ? (
        <p>No lists yet.</p>
      ) : (
        <ul>
          {lists.map((list) => (
            <li key={list.id}>{list.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
