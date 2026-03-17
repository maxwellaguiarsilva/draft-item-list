import { prisma } from "../lib/prisma";

export const groupService = {
  async getByList(listId: string) {
    return prisma.group.findMany({
      where: { listId },
      orderBy: { position: "asc" },
      include: { children: true, items: true },
    });
  },

  async create(listId: string, data: { name: string; parentId?: string; position: number }) {
    return prisma.group.create({
      data: {
        ...data,
        listId,
      },
    });
  },

  async update(id: string, data: { name?: string; position?: number; parentId?: string }) {
    return prisma.group.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.group.delete({
      where: { id },
    });
  },
};
