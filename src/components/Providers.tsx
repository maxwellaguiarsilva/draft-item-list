'use client';

import { AppProvider } from '@/context/AppContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>;
};
