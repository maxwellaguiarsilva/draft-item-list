/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useAppAction } from '../useAppAction';
import { useAppContext } from '../../context/AppContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});

describe('useAppAction', () => {
  const addNotification = vi.fn();

  beforeEach(() => {
    vi.mocked(useAppContext).mockReturnValue({
      addNotification,
      isSidebarOpen: true,
      toggleSidebar: vi.fn(),
      selectedListId: null,
      setSelectedListId: vi.fn(),
      notifications: [],
      removeNotification: vi.fn(),
    });
  });

  it('should call onSuccess on success', async () => {
    const action = vi.fn().mockResolvedValue({ success: true, data: 'done' });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAppAction(action, { onSuccess }));

    await act(async () => {
      await result.current.execute();
    });

    expect(action).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith('done');
    expect(addNotification).not.toHaveBeenCalled();
  });

  it('should call addNotification on failure', async () => {
    const action = vi.fn().mockResolvedValue({ success: false, error: 'failed' });
    const { result } = renderHook(() => useAppAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(action).toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith('failed', 'error');
  });
});
