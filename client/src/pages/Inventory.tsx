import { useState } from "react";
import { useInventory, useCreateInventoryItem } from "@/hooks/use-inventory";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryItemSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertInventoryItemSchema.extend({
  quantity: z.coerce.number().min(0),
  minQuantity: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"in_stock" | "low_stock" | "out_of_stock" | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: items, isLoading } = useInventory(search, statusFilter);
  const createItem = useCreateInventoryItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      location: "",
      quantity: 0,
      minQuantity: 5,
    },
  });

  const onSubmit = (data: FormValues) => {
    createItem.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  const getStatusBadge = (qty: number, minQty: number) => {
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty <= minQty) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Low Stock</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600 text-white">In Stock</Badge>;
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock levels and items</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...form.register("sku")} placeholder="ITEM-001" />
                  {form.formState.errors.sku && <p className="text-xs text-red-500">{form.formState.errors.sku.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" {...form.register("category")} placeholder="Electronics" />
                  {form.formState.errors.category && <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" {...form.register("name")} placeholder="Product Name" />
                {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register("location")} placeholder="Rack A-1" />
                  {form.formState.errors.location && <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Min Qty Alert</Label>
                  <Input id="minQuantity" type="number" {...form.register("minQuantity")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input id="quantity" type="number" {...form.register("quantity")} />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createItem.isPending}>
                  {createItem.isPending ? "Creating..." : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or SKU..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select 
          value={statusFilter || "all"} 
          onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val as any)}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading inventory...</TableCell>
              </TableRow>
            ) : items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No items found</TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                  <TableCell>{getStatusBadge(item.quantity, item.minQuantity)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
