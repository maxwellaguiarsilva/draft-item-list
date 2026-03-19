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
          where: { parentId: null }, // Fetch root groups
          include: {
            children: {
              include: {
                children: {
                  include: { items: true }
                },
                items: true
              }
            },
            items: true,
          },
          orderBy: { position: "asc" },
        },
        items: {
          where: { groupId: null },
          orderBy: { position: "asc" },
        },
      },
    });
  },

  async duplicate(userId: string, id: string) {
    const sourceList = await prisma.list.findUnique({
      where: { id, userId },
      include: {
        groups: {
          include: {
            items: true,
          },
        },
        items: {
          where: { groupId: null },
        },
      },
    });

    if (!sourceList) throw new Error("List not found");

    return prisma.$transaction(async (tx) => {
      const newList = await tx.list.create({
        data: {
          name: `${sourceList.name} (Copy)`,
          category: sourceList.category,
          userId,
        },
      });

      // Simple implementation for MVP: Duplicate groups and root items
      // Note: For deep recursive groups, this would need a recursive helper
      for (const group of sourceList.groups) {
        const newGroup = await tx.group.create({
          data: {
            name: group.name,
            position: group.position,
            listId: newList.id,
            items: {
              create: group.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                position: item.position,
                listId: newList.id,
              })),
            },
          },
        });
      }

      for (const item of sourceList.items) {
        await tx.item.create({
          data: {
            name: item.name,
            quantity: item.quantity,
            position: item.position,
            listId: newList.id,
          },
        });
      }

      return newList;
    });
  },
};
