'use client';

import React, { createContext, useContext, useState } from 'react';

type AppContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedListId: string | null;
  setSelectedListId: (id: string | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider value={{ isSidebarOpen, toggleSidebar, selectedListId, setSelectedListId }}>
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
