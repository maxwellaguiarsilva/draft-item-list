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
    const list = await prisma.list.findUnique({
      where: { id, userId },
    });

    if (!list) return null;

    const allGroups = await prisma.group.findMany({
      where: { listId: id },
      orderBy: { position: "asc" },
      include: { items: { orderBy: { position: "asc" } } },
    });

    const rootItems = await prisma.item.findMany({
      where: { listId: id, groupId: null },
      orderBy: { position: "asc" },
    });

    // Build group tree in memory
    const groupMap = new Map();
    allGroups.forEach((group) => {
      groupMap.set(group.id, { ...group, children: [] });
    });

    const rootGroups: any[] = [];
    allGroups.forEach((group) => {
      const mappedGroup = groupMap.get(group.id);
      if (group.parentId) {
        const parent = groupMap.get(group.parentId);
        if (parent) {
          parent.children.push(mappedGroup);
        } else {
          // If parent is not in the list (should not happen normally)
          rootGroups.push(mappedGroup);
        }
      } else {
        rootGroups.push(mappedGroup);
      }
    });

    return {
      ...list,
      groups: rootGroups,
      items: rootItems,
    };
  },

  async duplicate(userId: string, id: string) {
    const sourceList = await prisma.list.findUnique({
      where: { id, userId },
    });

    if (!sourceList) throw new Error("List not found");

    const allGroups = await prisma.group.findMany({
      where: { listId: id },
      include: { items: true },
    });

    const rootItems = await prisma.item.findMany({
      where: { listId: id, groupId: null },
    });

    return prisma.$transaction(async (tx) => {
      const newList = await tx.list.create({
        data: {
          name: `${sourceList.name} (Copy)`,
          category: sourceList.category,
          userId,
        },
      });

      // Map to keep track of oldGroupId -> newGroupId
      const groupIdMap = new Map<string, string>();

      // Recursive helper to clone groups while maintaining hierarchy
      const cloneGroups = async (parentId: string | null = null, newParentId: string | null = null) => {
        const groupsToClone = allGroups.filter((g) => g.parentId === parentId);
        
        for (const group of groupsToClone) {
          const newGroup = await tx.group.create({
            data: {
              name: group.name,
              position: group.position,
              listId: newList.id,
              parentId: newParentId,
            },
          });
          
          groupIdMap.set(group.id, newGroup.id);

          // Clone items in this group
          for (const item of group.items) {
            await tx.item.create({
              data: {
                name: item.name,
                quantity: item.quantity,
                position: item.position,
                listId: newList.id,
                groupId: newGroup.id,
              },
            });
          }

          // Recursively clone children
          await cloneGroups(group.id, newGroup.id);
        }
      };

      // Start cloning from root groups
      await cloneGroups(null, null);

      // Clone root items
      for (const item of rootItems) {
        await tx.item.create({
          data: {
            name: item.name,
            quantity: item.quantity,
            position: item.position,
            listId: newList.id,
            groupId: null,
          },
        });
      }

      return newList;
    });
  },

  async getCategories(userId: string) {
    const lists = await prisma.list.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });
    return lists.map(l => l.category);
  }
};
