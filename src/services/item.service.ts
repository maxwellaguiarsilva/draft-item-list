import { prisma } from "../lib/prisma";

export const itemService = {
  async getByList(userId: string, listId: string) {
    return prisma.item.findMany({
      where: { listId, list: { userId } },
      orderBy: { position: "asc" },
    });
  },

  async create(userId: string, listId: string, data: { name: string; quantity?: number; position: number; groupId?: string }) {
    const list = await prisma.list.findUnique({ where: { id: listId, userId } });
    if (!list) throw new Error("Unauthorized");

    return prisma.item.create({
      data: {
        ...data,
        listId,
      },
    });
  },

  async update(userId: string, id: string, data: { name?: string; quantity?: number; position?: number; groupId?: string }) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!item || item.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.item.update({
      where: { id },
      data,
    });
  },

  async delete(userId: string, id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!item || item.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.item.delete({
      where: { id },
    });
  },

  async duplicate(userId: string, id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!item || item.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.$transaction(async (tx) => {
      // Shift subsequent items to make room
      await tx.item.updateMany({
        where: {
          listId: item.listId,
          groupId: item.groupId,
          position: { gt: item.position },
        },
        data: {
          position: { increment: 1 },
        },
      });

      return tx.item.create({
        data: {
          name: `${item.name} (Copy)`,
          quantity: item.quantity,
          position: item.position + 1,
          listId: item.listId,
          groupId: item.groupId,
        },
      });
    });
  },

  async updatePosition(userId: string, id: string, newPosition: number) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!item || item.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.item.update({
      where: { id },
      data: { position: newPosition },
    });
  },
};
