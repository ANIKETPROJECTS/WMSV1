import { 
  type InventoryItem, 
  type InwardEntry, 
  type OutwardEntry 
} from "@shared/schema";

export const mockInventory: InventoryItem[] = [
  { id: 1, sku: "ITEM-001", name: "Wireless Mouse", category: "Electronics", location: "Rack A-1", quantity: 150, minQuantity: 20, lastMovedAt: new Date(), createdAt: new Date() },
  { id: 2, sku: "ITEM-002", name: "Mechanical Keyboard", category: "Electronics", location: "Rack A-2", quantity: 8, minQuantity: 15, lastMovedAt: new Date(), createdAt: new Date() },
  { id: 3, sku: "ITEM-003", name: "Office Chair", category: "Furniture", location: "Zone B", quantity: 45, minQuantity: 10, lastMovedAt: new Date(), createdAt: new Date() },
  { id: 4, sku: "ITEM-004", name: "Desk Lamp", category: "Electronics", location: "Rack A-3", quantity: 0, minQuantity: 5, lastMovedAt: new Date(), createdAt: new Date() },
  { id: 5, sku: "ITEM-005", name: "Notebook Set", category: "Stationery", location: "Rack C-1", quantity: 500, minQuantity: 50, lastMovedAt: new Date(), createdAt: new Date() },
];

export const mockInward: InwardEntry[] = [
  { id: 1, grnNo: "GRN-2024-001", supplier: "Tech Corp", date: new Date(), status: "Stored", items: [{ itemId: 1, quantity: 100 }], totalItems: 100 },
  { id: 2, grnNo: "GRN-2024-002", supplier: "Furniture Hub", date: new Date(), status: "QC Pending", items: [{ itemId: 3, quantity: 20 }], totalItems: 20 },
];

export const mockOutward: OutwardEntry[] = [
  { id: 1, dispatchNo: "DSP-2024-001", customer: "John Doe", date: new Date(), status: "Delivered", items: [{ itemId: 1, quantity: 10 }], totalItems: 10 },
  { id: 2, dispatchNo: "DSP-2024-002", customer: "Jane Smith", date: new Date(), status: "Dispatched", items: [{ itemId: 2, quantity: 5 }], totalItems: 5 },
];

export const mockDashboardStats = {
  totalItems: 5,
  lowStockItems: 2,
  totalInwardToday: 120,
  totalOutwardToday: 15,
  valuation: 245000,
  inventoryByCategory: [
    { name: 'Electronics', value: 3 },
    { name: 'Furniture', value: 1 },
    { name: 'Stationery', value: 1 },
  ],
  weeklyActivity: [
    { name: 'Mon', inward: 12, outward: 8 },
    { name: 'Tue', inward: 15, outward: 10 },
    { name: 'Wed', inward: 8, outward: 15 },
    { name: 'Thu', inward: 20, outward: 12 },
    { name: 'Fri', inward: 18, outward: 22 },
    { name: 'Sat', inward: 5, outward: 8 },
    { name: 'Sun', inward: 2, outward: 1 },
  ]
};

export const mockMISStats = {
  dailyStats: {
    totalInwardValuation: 240000,
    totalOutwardValuation: 110000,
    topItem: "Wireless Mouse",
    deadStockCount: 1,
  },
  inventorySummary: mockInventory.map(item => ({
    name: item.name,
    stock: item.quantity,
    value: item.quantity * 120
  })),
  movementAnalysis: {
    fastMoving: [
      { name: "Wireless Mouse", movements: 45 },
      { name: "Notebook Set", movements: 32 }
    ],
    slowMoving: [
      { name: "Office Chair", movements: 5 }
    ],
    deadStock: [
      { name: "Desk Lamp", lastMoved: 'Never' }
    ],
  },
  valuationReport: [
    { category: 'Electronics', value: 150000 },
    { category: 'Furniture', value: 80000 },
    { category: 'Stationery', value: 15000 },
  ]
};
