"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { listService } from "../../services/list.service";

export async function createList(data: { name: string; category: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await listService.create(session.user.id, data);
  revalidatePath("/dashboard");
}

export async function deleteList(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await listService.delete(session.user.id, id);
  revalidatePath("/dashboard");
}

export async function updateList(id: string, data: { name?: string; category?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await listService.update(session.user.id, id, data);
  revalidatePath("/dashboard");
}
