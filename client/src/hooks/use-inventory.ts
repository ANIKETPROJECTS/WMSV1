import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertInventoryItem } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useInventory(search?: string, status?: 'in_stock' | 'low_stock' | 'out_of_stock') {
  return useQuery({
    queryKey: [api.inventory.list.path, search, status],
    queryFn: async () => {
      const url = new URL(api.inventory.list.path, window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (status) url.searchParams.set("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
  });
}

export function useInventoryItem(id: number) {
  return useQuery({
    queryKey: [api.inventory.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.inventory.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      return api.inventory.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertInventoryItem) => {
      const validated = api.inventory.create.input.parse(data);
      const res = await fetch(api.inventory.create.path, {
        method: api.inventory.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.inventory.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create item");
      }
      return api.inventory.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({ title: "Success", description: "Item added to inventory" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertInventoryItem>) => {
      const validated = api.inventory.update.input.parse(updates);
      const url = buildUrl(api.inventory.update.path, { id });
      
      const res = await fetch(url, {
        method: api.inventory.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update item");
      return api.inventory.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({ title: "Success", description: "Inventory item updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
