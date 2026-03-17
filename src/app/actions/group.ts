"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { groupService } from "../../services/group.service";

export async function createGroup(listId: string, data: { name: string; parentId?: string; position: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await groupService.create(listId, data);
  revalidatePath(`/dashboard/${listId}`);
}

export async function updateGroup(id: string, listId: string, data: { name?: string; position?: number; parentId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await groupService.update(id, data);
  revalidatePath(`/dashboard/${listId}`);
}

export async function deleteGroup(id: string, listId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await groupService.delete(id);
  revalidatePath(`/dashboard/${listId}`);
}
