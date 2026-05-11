import React, { createContext, useContext, useState, useEffect } from "react";
import { dashboardApi, DashboardStatsDto } from "../api/dashboard";

type DashboardContextType = {
  stats: DashboardStatsDto | null;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    // Only fetch if stats is null to comply with "called just once" request
    if (stats !== null) return;
    
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard statistics", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to refresh dashboard statistics", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardContext.Provider value={{ stats, isLoading, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
};
