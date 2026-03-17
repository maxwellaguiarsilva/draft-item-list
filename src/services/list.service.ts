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
};
