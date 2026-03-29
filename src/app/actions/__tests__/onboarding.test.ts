import { describe, it, expect, vi } from 'vitest';
import { createDefaultData } from '../src/app/actions/onboarding';
import { listService } from '../src/services/list.service';
import { itemService } from '../src/services/item.service';
import { auth } from '../src/auth';
import { prisma } from '../src/lib/prisma';
import { UnauthorizedError } from '../src/lib/errors';

vi.mock('../src/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('../src/services/list.service', () => ({
  listService: {
    create: vi.fn(),
  },
}));

vi.mock('../src/services/item.service', () => ({
  itemService: {
    create: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('createDefaultData', () => {
  it('should create default data when user is authenticated and exists', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user123' } });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'user123' });
    (listService.create as any).mockResolvedValue({ id: 'list123' });
    (itemService.create as any).mockResolvedValue({ id: 'item123' });

    await createDefaultData();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user123' } });
    expect(listService.create).toHaveBeenCalledWith('user123', { name: 'List', category: 'General' });
    expect(itemService.create).toHaveBeenCalledWith('user123', 'list123', { name: 'Item 1', position: 0 });
  });

  it('should throw UnauthorizedError when user is not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    await expect(createDefaultData()).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when user does not exist in database', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user123' } });
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(createDefaultData()).rejects.toThrow(UnauthorizedError);
  });
});
