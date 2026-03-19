import { prisma } from "../lib/prisma";

export const groupService = {
  async getByList(userId: string, listId: string) {
    return prisma.group.findMany({
      where: { listId, list: { userId } },
      orderBy: { position: "asc" },
      include: { children: true, items: true },
    });
  },

  async create(userId: string, listId: string, data: { name: string; parentId?: string; position: number }) {
    // Verify ownership
    const list = await prisma.list.findUnique({ where: { id: listId, userId } });
    if (!list) throw new Error("Unauthorized");

    return prisma.group.create({
      data: {
        ...data,
        listId,
      },
    });
  },

  async update(userId: string, id: string, data: { name?: string; position?: number; parentId?: string }) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!group || group.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.group.update({
      where: { id },
      data,
    });
  },

  async delete(userId: string, id: string) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!group || group.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.group.delete({
      where: { id },
    });
  },
};
