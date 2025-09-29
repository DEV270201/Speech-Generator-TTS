'use client';

export interface AppContextProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

import React, { createContext, useContext, useState } from 'react';
const AppContext = createContext<AppContextProps>({
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    return (             
    <AppContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
        {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

