import { useState } from "react";
import { useInwardEntries, useCreateInwardEntry } from "@/hooks/use-inward";
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

export default function Inward() {
  const { data: entries, isLoading } = useInwardEntries();
  const { data: inventory } = useInventory();
  const createEntry = useCreateInwardEntry();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [items, setItems] = useState<{ itemId: number; quantity: number }[]>([]);
  
  // Form state
  const [supplier, setSupplier] = useState("");
  const [grnNo, setGrnNo] = useState("");
  const [status, setStatus] = useState("Received");

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
      grnNo,
      supplier,
      status,
      date: date.toISOString(),
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        // Reset form
        setSupplier("");
        setGrnNo("");
        setStatus("Received");
        setItems([]);
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Inward Entries</h1>
          <p className="text-muted-foreground">Track goods received (GRN)</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4" /> New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Inward Entry (GRN)</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>GRN Number</Label>
                  <Input value={grnNo} onChange={(e) => setGrnNo(e.target.value)} placeholder="GRN-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier Name" />
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
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="QC Pending">QC Pending</SelectItem>
                      <SelectItem value="Stored">Stored</SelectItem>
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
                          {item.name} ({item.sku})
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
                {createEntry.isPending ? "Creating..." : "Create GRN"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GRN No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
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
                  <TableCell className="font-mono text-xs font-medium">{entry.grnNo}</TableCell>
                  <TableCell>{entry.date ? format(new Date(entry.date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>{entry.supplier}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "Stored" ? "default" : "secondary"}>
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
