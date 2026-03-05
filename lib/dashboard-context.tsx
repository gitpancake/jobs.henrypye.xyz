"use client";

import { createContext, useContext } from "react";

interface DashboardContextType {
  refreshStats: () => Promise<void>;
  isObfuscated: boolean;
}

const DashboardContext = createContext<DashboardContextType>({
  refreshStats: async () => {},
  isObfuscated: false,
});

export const useDashboard = () => useContext(DashboardContext);
export { DashboardContext };
