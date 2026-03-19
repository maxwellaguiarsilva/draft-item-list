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

  async duplicate(userId: string, id: string) {
    const sourceGroup = await prisma.group.findUnique({
      where: { id },
      include: { 
        list: true,
        items: true,
        children: {
          include: {
            items: true,
            children: true // This only goes one level deep in the include, 
                           // but we'll handle recursion properly
          }
        }
      }
    });

    if (!sourceGroup || sourceGroup.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.$transaction(async (tx) => {
      const cloneGroupRecursive = async (group: any, parentId: string | null) => {
        const newGroup = await tx.group.create({
          data: {
            name: `${group.name} (Copy)`,
            position: group.position + 1,
            listId: group.listId,
            parentId: parentId,
          },
        });

        // Clone items
        for (const item of group.items || []) {
          await tx.item.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              position: item.position,
              listId: group.listId,
              groupId: newGroup.id,
            },
          });
        }

        // Clone children (recursive)
        const children = await tx.group.findMany({ 
          where: { parentId: group.id },
          include: { items: true }
        });
        
        for (const child of children) {
          await cloneGroupRecursive(child, newGroup.id);
        }

        return newGroup;
      };

      return await cloneGroupRecursive(sourceGroup, sourceGroup.parentId);
    });
  },

  async updatePosition(userId: string, id: string, newPosition: number) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { list: true }
    });
    if (!group || group.list.userId !== userId) throw new Error("Unauthorized");

    return prisma.group.update({
      where: { id },
      data: { position: newPosition },
    });
  },
};
