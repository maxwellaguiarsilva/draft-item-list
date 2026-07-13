"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/action-utils";
import { listService } from "../../services/list.service";

async function wrapAction<T>(action: () => Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An error occurred" };
  }
}

export const createList = withAuth(async (userId, data: { name: string; category: string }) => {
  return await wrapAction(async () => {
    await listService.create(userId, data);
    revalidatePath("/dashboard");
  });
});

export const duplicateList = withAuth(async (userId, id: string) => {
  return await wrapAction(async () => {
    await listService.duplicate(userId, id);
    revalidatePath("/dashboard");
  });
});

export const deleteList = withAuth(async (userId, id: string) => {
  return await wrapAction(async () => {
    await listService.delete(userId, id);
    revalidatePath("/dashboard");
  });
});

export const updateList = withAuth(async (userId, id: string, data: { name?: string; category?: string }) => {
  return await wrapAction(async () => {
    await listService.update(userId, id, data);
    revalidatePath("/dashboard");
  });
});

export const getListDetails = withAuth(async (userId, id: string) => {
  return await wrapAction(async () => {
    return await listService.getListDetails(userId, id);
  });
});

export const getCategories = withAuth(async (userId) => {
  return await wrapAction(async () => {
    return await listService.getCategories(userId);
  });
});

export const moveList = withAuth(async (userId, id: string, direction: 'up' | 'down') => {
  return await wrapAction(async () => {
    await listService.updatePosition(userId, id, direction);
    revalidatePath("/dashboard");
  });
});

export const swapEntities = withAuth(async (
  userId,
  entity1: { id: string; type: "item" | "group"; position: number },
  entity2: { id: string; type: "item" | "group"; position: number }
) => {
  return await wrapAction(async () => {
    await listService.swapPositions(userId, entity1, entity2);
    revalidatePath("/dashboard");
  });
});
