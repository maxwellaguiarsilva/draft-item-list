"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/action-utils";
import { itemService } from "../../services/item.service";

export const createItem = withAuth(async (userId, listId: string, data: { name: string; quantity?: number; position: number; groupId?: string }) => {
  await itemService.create(userId, listId, data);
  revalidatePath(`/dashboard`);
});

export const updateItem = withAuth(async (userId, id: string, data: { name?: string; quantity?: number; position?: number; groupId?: string }) => {
  await itemService.update(userId, id, data);
  revalidatePath(`/dashboard`);
});

export const deleteItem = withAuth(async (userId, id: string) => {
  await itemService.delete(userId, id);
  revalidatePath(`/dashboard`);
});

export const duplicateItem = withAuth(async (userId, id: string) => {
  await itemService.duplicate(userId, id);
  revalidatePath(`/dashboard`);
});

export const updateItemPosition = withAuth(async (userId, id: string, newPosition: number) => {
  await itemService.updatePosition(userId, id, newPosition);
  revalidatePath(`/dashboard`);
});
