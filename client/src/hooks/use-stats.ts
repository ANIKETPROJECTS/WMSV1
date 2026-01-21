import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.stats.dashboard.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useMISStats() {
  return useQuery({
    queryKey: [api.stats.mis.path],
    queryFn: async () => {
      const res = await fetch(api.stats.mis.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch MIS stats");
      return api.stats.mis.responses[200].parse(await res.json());
    },
    refetchInterval: 60000, // Refresh every 1m
  });
}
