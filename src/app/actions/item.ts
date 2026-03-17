"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { itemService } from "../../services/item.service";

export async function createItem(listId: string, data: { name: string; quantity?: number; position: number; groupId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.create(listId, data);
  revalidatePath(`/dashboard/${listId}`);
}

export async function updateItem(id: string, listId: string, data: { name?: string; quantity?: number; position?: number; groupId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.update(id, data);
  revalidatePath(`/dashboard/${listId}`);
}

export async function deleteItem(id: string, listId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await itemService.delete(id);
  revalidatePath(`/dashboard/${listId}`);
}
