"use server";

import { auth } from "@/auth";
import { listService } from "@/services/list.service";
import { itemService } from "@/services/item.service";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";

export async function createDefaultData() {
  const session = await auth();
  if (!session || !session.user?.id) throw new UnauthorizedError();

  // Verify user exists in the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new UnauthorizedError("User not found in database");
  }

  const list = await listService.create(session.user.id, { name: "List", category: "General" });
  await itemService.create(session.user.id, list.id, { name: "Item 1", position: 0 });
}
