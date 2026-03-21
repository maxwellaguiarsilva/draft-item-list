"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/action-utils";
import { groupService } from "../../services/group.service";

export const createGroup = withAuth(async (userId, listId: string, data: { name: string; parentId?: string; position: number }) => {
  await groupService.create(userId, listId, data);
  revalidatePath(`/dashboard`);
});

export const updateGroup = withAuth(async (userId, id: string, data: { name?: string; position?: number; parentId?: string }) => {
  await groupService.update(userId, id, data);
  revalidatePath(`/dashboard`);
});

export const deleteGroup = withAuth(async (userId, id: string) => {
  await groupService.delete(userId, id);
  revalidatePath(`/dashboard`);
});

export const duplicateGroup = withAuth(async (userId, id: string) => {
  await groupService.duplicate(userId, id);
  revalidatePath(`/dashboard`);
});

export const updateGroupPosition = withAuth(async (userId, id: string, newPosition: number) => {
  await groupService.updatePosition(userId, id, newPosition);
  revalidatePath(`/dashboard`);
});
