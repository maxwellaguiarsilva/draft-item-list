import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listService } from "@/services";
import { ListForm } from "@/components/ListForm";
import { DeleteButton } from "@/components/DeleteButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  const lists = await listService.getAll(session.user.id);

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">My Lists</h1>
      <ListForm />
      {lists.length === 0 ? (
        <p className="mt-4">No lists yet.</p>
      ) : (
        <ul className="mt-4">
          {lists.map((list) => (
            <li key={list.id} className="flex justify-between border-b p-2">
              <span>{list.name} ({list.category})</span>
              <DeleteButton id={list.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
