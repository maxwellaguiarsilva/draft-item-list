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

  async getListDetails(userId: string, id: string) {
    return prisma.list.findUnique({
      where: { id, userId },
      include: {
        groups: {
          include: {
            children: { include: { items: true } },
            items: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });
  },
};
