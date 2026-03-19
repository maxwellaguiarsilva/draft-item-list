"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { itemService } from "../../services/item.service";

export async function createItem(listId: string, data: { name: string; quantity?: number; position: number; groupId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.create(session.user.id, listId, data);
  revalidatePath(`/dashboard`);
}

export async function updateItem(id: string, listId: string, data: { name?: string; quantity?: number; position?: number; groupId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.update(session.user.id, id, data);
  revalidatePath(`/dashboard`);
}

export async function deleteItem(id: string, listId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.delete(session.user.id, id);
  revalidatePath(`/dashboard`);
}

export async function duplicateItem(id: string, listId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.duplicate(session.user.id, id);
  revalidatePath(`/dashboard`);
}

export async function updateItemPosition(id: string, listId: string, newPosition: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.updatePosition(session.user.id, id, newPosition);
  revalidatePath(`/dashboard`);
}
