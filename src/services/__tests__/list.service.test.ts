import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listService } from '../list.service';
import { prisma } from '../../lib/prisma';
import { List, Group, Item } from '@prisma/client';

// Mock the prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    list: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      aggregate: vi.fn(),
    },
    group: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('listService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return lists for a user ordered by position', async () => {
      const mockLists = [{ id: '1', name: 'Test List', userId: 'user-1', position: 0 }];
      vi.mocked(prisma.list.findMany).mockResolvedValue(mockLists as unknown as List[]);

      const result = await listService.getAll('user-1');
      expect(result).toEqual(mockLists);
      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { position: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new list for a user with incremented position', async () => {
      const listData = { name: 'New List', category: 'Testing' };
      vi.mocked(prisma.list.aggregate).mockResolvedValue({ _max: { position: 5 } } as unknown as { _max: { position: number | null } });
      vi.mocked(prisma.list.create).mockResolvedValue({ id: '2', ...listData, userId: 'user-1', position: 6 } as unknown as List);

      const result = await listService.create('user-1', listData);
      expect(result.position).toBe(6);
      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          ...listData,
          userId: 'user-1',
          position: 6,
        },
      });
    });
  });

  describe('updatePosition', () => {
    it('should swap positions with the list above when moving up', async () => {
      const currentList = { id: 'l2', position: 2, userId: 'u1' };
      const otherList = { id: 'l1', position: 1, userId: 'u1' };

      vi.mocked(prisma.list.findUnique).mockResolvedValue(currentList as unknown as List);
      vi.mocked(prisma.list.findFirst).mockResolvedValue(otherList as unknown as List);
      vi.mocked(prisma.list.update).mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === 'l2') return { ...currentList, position: 1 } as unknown as List;
        if (where.id === 'l1') return { ...otherList, position: 2 } as unknown as List;
        return null as unknown as List;
      });

      const result = await listService.updatePosition('u1', 'l2', 'up');

      expect(result.position).toBe(1);
      expect(prisma.list.update).toHaveBeenCalledTimes(2);
    });

    it('should not do anything if no list is found in that direction', async () => {
        const currentList = { id: 'l1', position: 0, userId: 'u1' };
        vi.mocked(prisma.list.findUnique).mockResolvedValue(currentList as unknown as List);
        vi.mocked(prisma.list.findFirst).mockResolvedValue(null);

        const result = await listService.updatePosition('u1', 'l1', 'up');
        expect(result).toEqual(currentList);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });
  });

  describe('getListDetails', () => {
    it('should reconstruct group hierarchy correctly', async () => {
      const mockList = { id: 'l1', name: 'L1', userId: 'u1', category: 'C1' };
      const mockGroups = [
        { id: 'g1', name: 'G1', parentId: null, position: 0, items: [] },
        { id: 'g2', name: 'G2', parentId: 'g1', position: 0, items: [{ id: 'i1', name: 'I1', position: 0, quantity: 1 }] },
      ];
      const mockRootItems = [{ id: 'ri1', name: 'RI1', position: 0, quantity: 2 }];

      vi.mocked(prisma.list.findUnique).mockResolvedValue(mockList as unknown as List);
      vi.mocked(prisma.group.findMany).mockResolvedValue(mockGroups as unknown as (Group & { items: Item[] })[]);
      vi.mocked(prisma.item.findMany).mockResolvedValue(mockRootItems as unknown as Item[]);

      const result = await listService.getListDetails('u1', 'l1');

      expect(result?.name).toBe('L1');
      expect(result?.groups.length).toBe(1);
      expect(result?.groups[0].id).toBe('g1');
      expect(result?.groups[0].children.length).toBe(1);
      expect(result?.groups[0].children[0].id).toBe('g2');
      expect(result?.items.length).toBe(1);
    });
  });

  describe('duplicate', () => {
    it('should perform deep cloning including hierarchy and shift other lists', async () => {
       const mockSourceList = { id: 'l1', name: 'L1', userId: 'u1', category: 'C1', position: 1 };
       const mockGroups = [
         { id: 'g1', name: 'G1', parentId: null, position: 0, items: [] },
         { id: 'g2', name: 'G2', parentId: 'g1', position: 0, items: [{ id: 'i1', name: 'I1', position: 0, quantity: 5 }] },
       ];
       const mockRootItems = [{ id: 'ri1', name: 'RI1', position: 0, quantity: 1 }];

       vi.mocked(prisma.list.findUnique).mockResolvedValue(mockSourceList as unknown as List);
       vi.mocked(prisma.group.findMany).mockResolvedValue(mockGroups as unknown as (Group & { items: Item[] })[]);
       vi.mocked(prisma.item.findMany).mockResolvedValue(mockRootItems as unknown as Item[]);
       vi.mocked(prisma.list.create).mockResolvedValue({ id: 'new-l1', name: 'L1 (Copy)', position: 2 } as unknown as List);
       vi.mocked(prisma.group.create)
         .mockResolvedValueOnce({ id: 'new-g1' } as unknown as Group)
         .mockResolvedValueOnce({ id: 'new-g2' } as unknown as Group);
       vi.mocked(prisma.item.create).mockResolvedValue({ id: 'new-i1' } as unknown as Item);

       const result = await listService.duplicate('u1', 'l1');

       expect(result.name).toBe('L1 (Copy)');
       expect(result.position).toBe(2);
       expect(prisma.list.updateMany).toHaveBeenCalledWith({
         where: {
           userId: 'u1',
           position: { gt: 1 },
         },
         data: {
           position: { increment: 1 },
         },
       });
       expect(prisma.list.create).toHaveBeenCalledWith(expect.objectContaining({
         data: expect.objectContaining({
           position: 2
         })
       }));
    });
  });
});
