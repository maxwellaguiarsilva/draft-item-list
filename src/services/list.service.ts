import { prisma } from "../lib/prisma";
import { Group, Item, List } from "@prisma/client";

export type GroupWithItems = Group & {
  items: Item[];
};

export type GroupTreeItem = GroupWithItems & {
  children: GroupTreeItem[];
};

export type ListDetails = List & {
  groups: GroupTreeItem[];
  items: Item[];
};

export const listService = {
  async getAll(userId: string) {
    return prisma.list.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    });
  },

  async create(userId: string, data: { name: string; category: string }) {
    const maxPosition = await prisma.list.aggregate({
      where: { userId },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? -1) + 1;

    return prisma.list.create({
      data: {
        ...data,
        userId,
        position: newPosition,
      },
    });
  },

  async delete(userId: string, id: string) {
    return prisma.list.delete({
      where: { id, userId },
    });
  },

  async update(userId: string, id: string, data: { name?: string; category?: string; position?: number }) {
    return prisma.list.update({
      where: { id, userId },
      data,
    });
  },

  async updatePosition(userId: string, id: string, direction: 'up' | 'down') {
    const currentList = await prisma.list.findUnique({
      where: { id, userId },
    });

    if (!currentList) throw new Error("List not found");

    const otherList = await prisma.list.findFirst({
      where: {
        userId,
        position: direction === 'up' ? { lt: currentList.position } : { gt: currentList.position },
      },
      orderBy: {
        position: direction === 'up' ? 'desc' : 'asc',
      },
    });

    if (!otherList) return currentList;

    return prisma.$transaction(async (tx) => {
      const updatedList = await tx.list.update({
        where: { id: currentList.id },
        data: { position: otherList.position },
      });

      await tx.list.update({
        where: { id: otherList.id },
        data: { position: currentList.position },
      });

      return updatedList;
    });
  },

  async getListDetails(userId: string, id: string): Promise<ListDetails | null> {
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
    const groupMap = new Map<string, GroupTreeItem>();
    allGroups.forEach((group) => {
      groupMap.set(group.id, { ...group, children: [] });
    });

    const rootGroups: GroupTreeItem[] = [];
    allGroups.forEach((group) => {
      const mappedGroup = groupMap.get(group.id)!;
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
    } as ListDetails;
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
      // Shift other lists to make room for the new duplicate
      await tx.list.updateMany({
        where: {
          userId,
          position: { gt: sourceList.position },
        },
        data: {
          position: { increment: 1 },
        },
      });

      const newList = await tx.list.create({
        data: {
          name: `${sourceList.name} (Copy)`,
          category: sourceList.category,
          userId,
          position: sourceList.position + 1,
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
  },

  async swapPositions(
    userId: string,
    entity1: { id: string; type: "item" | "group"; position: number },
    entity2: { id: string; type: "item" | "group"; position: number }
  ) {
    return prisma.$transaction(async (tx) => {
      // Update entity 1
      if (entity1.type === "item") {
        await tx.item.update({
          where: { id: entity1.id, list: { userId } },
          data: { position: entity2.position },
        });
      } else {
        await tx.group.update({
          where: { id: entity1.id, list: { userId } },
          data: { position: entity2.position },
        });
      }

      // Update entity 2
      if (entity2.type === "item") {
        await tx.item.update({
          where: { id: entity2.id, list: { userId } },
          data: { position: entity1.position },
        });
      } else {
        await tx.group.update({
          where: { id: entity2.id, list: { userId } },
          data: { position: entity1.position },
        });
      }
    });
  },
};
