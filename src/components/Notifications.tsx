'use client';

import { useAppContext } from '@/context/AppContext';

export const Notifications = () => {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-4 rounded shadow-lg text-white ${
            n.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          onClick={() => removeNotification(n.id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};
