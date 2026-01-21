import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertOutwardEntry } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOutwardEntries() {
  return useQuery({
    queryKey: [api.outward.list.path],
    queryFn: async () => {
      const res = await fetch(api.outward.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch outward entries");
      return api.outward.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateOutwardEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertOutwardEntry) => {
      const validated = api.outward.create.input.parse(data);
      const res = await fetch(api.outward.create.path, {
        method: api.outward.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.outward.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create outward entry");
      }
      return api.outward.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.outward.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({ title: "Success", description: "Outward entry created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
