"use client";

import { createContext, ReactNode } from "react";

interface GlobalContextType {}

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const contextValue = {};

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
