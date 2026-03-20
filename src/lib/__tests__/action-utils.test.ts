import { describe, it, expect, vi } from 'vitest';
import { withAuth } from '../action-utils';
import { auth } from '../../auth';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

describe('withAuth', () => {
  it('should return unauthorized if no session exists', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);
    const result = await wrappedHandler();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler if session exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);

    const handler = vi.fn().mockResolvedValue('success');
    const wrappedHandler = withAuth(handler);
    const result = await wrappedHandler();

    expect(result).toEqual({ success: true, data: 'success' });
    expect(handler).toHaveBeenCalledWith('user1');
  });
  
  it('should return error if handler throws', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);

    const handler = vi.fn().mockRejectedValue(new Error('handler error'));
    const wrappedHandler = withAuth(handler);
    const result = await wrappedHandler();

    expect(result).toEqual({ success: false, error: 'handler error' });
  });
});
