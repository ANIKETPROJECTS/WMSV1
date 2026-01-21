import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertInwardEntry } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useInwardEntries() {
  return useQuery({
    queryKey: [api.inward.list.path],
    queryFn: async () => {
      const res = await fetch(api.inward.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inward entries");
      return api.inward.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInwardEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInwardEntry) => {
      const validated = api.inward.create.input.parse(data);
      const res = await fetch(api.inward.create.path, {
        method: api.inward.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.inward.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create inward entry");
      }
      return api.inward.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inward.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({ title: "Success", description: "Inward entry created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
