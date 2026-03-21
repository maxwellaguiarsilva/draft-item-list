'use client';

import React, { createContext, useContext, useState } from 'react';

export type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

type AppContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedListId: string | null;
  setSelectedListId: (id: string | null) => void;
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider value={{ isSidebarOpen, toggleSidebar, selectedListId, setSelectedListId, notifications, addNotification, removeNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
