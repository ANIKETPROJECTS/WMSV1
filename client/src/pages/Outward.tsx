import { useState } from "react";
import { useOutwardEntries, useCreateOutwardEntry } from "@/hooks/use-outward";
import { useInventory } from "@/hooks/use-inventory";
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
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Outward() {
  const { data: entries, isLoading } = useOutwardEntries();
  const { data: inventory } = useInventory();
  const createEntry = useCreateOutwardEntry();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [items, setItems] = useState<{ itemId: number; quantity: number }[]>([]);
  
  // Form state
  const [customer, setCustomer] = useState("");
  const [dispatchNo, setDispatchNo] = useState("");
  const [status, setStatus] = useState("Packed");

  // Item adding state
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const addItem = () => {
    if (!selectedItemId || !quantity) return;
    setItems([...items, { itemId: Number(selectedItemId), quantity: Number(quantity) }]);
    setSelectedItemId("");
    setQuantity("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    createEntry.mutate({
      dispatchNo,
      customer,
      status,
      date: date.toISOString(),
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setCustomer("");
        setDispatchNo("");
        setStatus("Packed");
        setItems([]);
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Outward Entries</h1>
          <p className="text-muted-foreground">Manage Dispatches & Delivery</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4" /> New Dispatch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Outward Dispatch</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dispatch Number</Label>
                  <Input value={dispatchNo} onChange={(e) => setDispatchNo(e.target.value)} placeholder="DSP-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer Name" />
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-l pl-6">
                <Label>Add Items</Label>
                <div className="flex gap-2">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory?.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name} ({item.sku}) - Avail: {item.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Qty" 
                    className="w-20"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Button variant="secondary" onClick={addItem}>Add</Button>
                </div>

                <div className="bg-muted/30 rounded-lg border h-[200px] overflow-y-auto p-2 space-y-2">
                  {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No items added yet
                    </div>
                  ) : (
                    items.map((item, idx) => {
                      const invItem = inventory?.find(i => i.id === item.itemId);
                      return (
                        <div key={idx} className="flex justify-between items-center bg-background p-2 rounded border shadow-sm">
                          <span className="text-sm font-medium">{invItem?.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeItem(idx)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createEntry.isPending || items.length === 0}>
                {createEntry.isPending ? "Creating..." : "Create Dispatch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading entries...</TableCell>
              </TableRow>
            ) : entries?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No entries found</TableCell>
              </TableRow>
            ) : (
              entries?.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs font-medium">{entry.dispatchNo}</TableCell>
                  <TableCell>{entry.date ? format(new Date(entry.date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>{entry.customer}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "Delivered" ? "default" : "secondary"}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{entry.totalItems}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
