import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listService } from '../list.service';
import { prisma } from '../../lib/prisma';

// Mock the prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    list: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    group: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('listService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return lists for a user', async () => {
      const mockLists = [{ id: '1', name: 'Test List', userId: 'user-1' }];
      (prisma.list.findMany as any).mockResolvedValue(mockLists);

      const result = await listService.getAll('user-1');
      expect(result).toEqual(mockLists);
      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new list for a user', async () => {
      const listData = { name: 'New List', category: 'Testing' };
      (prisma.list.create as any).mockResolvedValue({ id: '2', ...listData, userId: 'user-1' });

      const result = await listService.create('user-1', listData);
      expect(result.name).toBe('New List');
      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          ...listData,
          userId: 'user-1',
        },
      });
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

      (prisma.list.findUnique as any).mockResolvedValue(mockList);
      (prisma.group.findMany as any).mockResolvedValue(mockGroups);
      (prisma.item.findMany as any).mockResolvedValue(mockRootItems);

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
    it('should perform deep cloning including hierarchy', async () => {
       const mockSourceList = { id: 'l1', name: 'L1', userId: 'u1', category: 'C1' };
       const mockGroups = [
         { id: 'g1', name: 'G1', parentId: null, position: 0, items: [] },
         { id: 'g2', name: 'G2', parentId: 'g1', position: 0, items: [{ id: 'i1', name: 'I1', position: 0, quantity: 5 }] },
       ];
       const mockRootItems = [{ id: 'ri1', name: 'RI1', position: 0, quantity: 1 }];

       (prisma.list.findUnique as any).mockResolvedValue(mockSourceList);
       (prisma.group.findMany as any).mockResolvedValue(mockGroups);
       (prisma.item.findMany as any).mockResolvedValue(mockRootItems);
       (prisma.list.create as any).mockResolvedValue({ id: 'new-l1', name: 'L1 (Copy)' });
       (prisma.group.create as any)
         .mockResolvedValueOnce({ id: 'new-g1' })
         .mockResolvedValueOnce({ id: 'new-g2' });

       const result = await listService.duplicate('u1', 'l1');

       expect(result.name).toBe('L1 (Copy)');
       expect(prisma.list.create).toHaveBeenCalled();
       expect(prisma.group.create).toHaveBeenCalledTimes(2);
       expect(prisma.item.create).toHaveBeenCalledTimes(2); // One in g2, one in root
    });
  });
});
