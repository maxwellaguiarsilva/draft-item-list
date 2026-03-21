'use client';

import { useTransition } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Result } from '@/lib/action-utils';

export function useAppAction<T extends any[], R>(
  action: (...args: T) => Promise<Result<R>>,
  options?: { onSuccess?: (data: R) => void }
) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useAppContext();

  const execute = (...args: T) => {
    startTransition(async () => {
      const result = await action(...args);
      if (result.success) {
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        }
      } else {
        addNotification(result.error, 'error');
      }
    });
  };

  return { execute, isPending };
}
