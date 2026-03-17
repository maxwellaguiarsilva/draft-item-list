import { prisma } from "../lib/prisma";

export const listService = {
  async getAll(userId: string) {
    return prisma.list.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(userId: string, data: { name: string; category: string }) {
    return prisma.list.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  async delete(userId: string, id: string) {
    return prisma.list.delete({
      where: { id, userId },
    });
  },

  async update(userId: string, id: string, data: { name?: string; category?: string }) {
    return prisma.list.update({
      where: { id, userId },
      data,
    });
  },

  async duplicate(userId: string, id: string) {
    const list = await prisma.list.findUnique({
      where: { id, userId },
    });
    if (!list) throw new Error("List not found");

    return prisma.list.create({
      data: {
        name: `${list.name} (Copy)`,
        category: list.category,
        userId,
      },
    });
  },
};
