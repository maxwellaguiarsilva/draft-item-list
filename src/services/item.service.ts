import { prisma } from "../lib/prisma";

export const itemService = {
  async getByList(listId: string) {
    return prisma.item.findMany({
      where: { listId },
      orderBy: { position: "asc" },
    });
  },

  async create(listId: string, data: { name: string; quantity?: number; position: number; groupId?: string }) {
    return prisma.item.create({
      data: {
        ...data,
        listId,
      },
    });
  },

  async update(id: string, data: { name?: string; quantity?: number; position?: number; groupId?: string }) {
    return prisma.item.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.item.delete({
      where: { id },
    });
  },
};
