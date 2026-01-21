import { db } from "./db";
import {
  inventoryItems,
  inwardEntries,
  outwardEntries,
  type InventoryItem,
  type InsertInventoryItem,
  type InwardEntry,
  type InsertInwardEntry,
  type OutwardEntry,
  type InsertOutwardEntry,
  type InventoryStats
} from "@shared/schema";
import { eq, desc, sql, sum, and, gte, lt } from "drizzle-orm";
import { 
  mockInventory, 
  mockInward, 
  mockOutward, 
  mockDashboardStats, 
  mockMISStats 
} from "./mockData";

export interface IStorage {
  // Inventory
  getInventoryItems(search?: string, status?: string): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  
  // Inward
  getInwardEntries(): Promise<InwardEntry[]>;
  createInwardEntry(entry: InsertInwardEntry): Promise<InwardEntry>;
  
  // Outward
  getOutwardEntries(): Promise<OutwardEntry[]>;
  createOutwardEntry(entry: InsertOutwardEntry): Promise<OutwardEntry>;

  // Stats
  getDashboardStats(): Promise<any>;
  getMISStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  private isNetlify = !!process.env.NETLIFY;

  // Inventory
  async getInventoryItems(search?: string, status?: string): Promise<InventoryItem[]> {
    let items: InventoryItem[];
    if (this.isNetlify) {
      items = mockInventory;
    } else {
      items = await db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt));
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.sku.toLowerCase().includes(lowerSearch)
      );
    }

    if (status) {
      items = items.filter(item => {
        if (status === 'out_of_stock') return item.quantity === 0;
        if (status === 'low_stock') return item.quantity > 0 && item.quantity <= item.minQuantity;
        if (status === 'in_stock') return item.quantity > item.minQuantity;
        return true;
      });
    }

    return items;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    if (this.isNetlify) return mockInventory.find(i => i.id === id);
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [updated] = await db.update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updated;
  }

  // Inward
  async getInwardEntries(): Promise<InwardEntry[]> {
    if (this.isNetlify) return mockInward;
    return await db.select().from(inwardEntries).orderBy(desc(inwardEntries.date));
  }

  async createInwardEntry(entry: InsertInwardEntry): Promise<InwardEntry> {
    const [newEntry] = await db.insert(inwardEntries).values(entry).returning();
    
    // Update inventory quantities
    for (const item of entry.items) {
      const inventoryItem = await this.getInventoryItem(item.itemId);
      if (inventoryItem) {
        await this.updateInventoryItem(item.itemId, {
          quantity: inventoryItem.quantity + item.quantity
        });
      }
    }
    
    return newEntry;
  }

  // Outward
  async getOutwardEntries(): Promise<OutwardEntry[]> {
    if (this.isNetlify) return mockOutward;
    return await db.select().from(outwardEntries).orderBy(desc(outwardEntries.date));
  }

  async createOutwardEntry(entry: InsertOutwardEntry): Promise<OutwardEntry> {
    const [newEntry] = await db.insert(outwardEntries).values(entry).returning();
    
    // Update inventory quantities
    for (const item of entry.items) {
      const inventoryItem = await this.getInventoryItem(item.itemId);
      if (inventoryItem) {
        await this.updateInventoryItem(item.itemId, {
          quantity: Math.max(0, inventoryItem.quantity - item.quantity)
        });
      }
    }

    return newEntry;
  }

  // Stats
  async getDashboardStats(): Promise<any> {
    if (this.isNetlify) return mockDashboardStats;
    const allInventory = await this.getInventoryItems();
    
    const totalItems = allInventory.length;
    const lowStockItems = allInventory.filter(i => i.quantity <= i.minQuantity).length;
    const valuation = allInventory.reduce((acc, i) => acc + (i.quantity * 120), 0); // ₹ valuation

    // Simple category grouping
    const categoryMap = new Map<string, number>();
    allInventory.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + 1);
    });
    const inventoryByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // Dummy weekly activity
    const weeklyActivity = [
      { name: 'Mon', inward: 12, outward: 8 },
      { name: 'Tue', inward: 15, outward: 10 },
      { name: 'Wed', inward: 8, outward: 15 },
      { name: 'Thu', inward: 20, outward: 12 },
      { name: 'Fri', inward: 18, outward: 22 },
      { name: 'Sat', inward: 5, outward: 8 },
      { name: 'Sun', inward: 2, outward: 1 },
    ];

    return {
      totalItems,
      lowStockItems,
      totalInwardToday: 12, 
      totalOutwardToday: 8, 
      valuation,
      inventoryByCategory,
      weeklyActivity
    };
  }

  async getMISStats(): Promise<any> {
    if (this.isNetlify) return mockMISStats;
    const allInventory = await this.getInventoryItems();
    const inward = await this.getInwardEntries();
    const outward = await this.getOutwardEntries();

    const deadStock = allInventory.filter(item => {
      if (!item.lastMovedAt) return true;
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return item.lastMovedAt < ninetyDaysAgo;
    });

    return {
      dailyStats: {
        totalInwardValuation: 240000,
        totalOutwardValuation: 110000,
        topItem: "Wireless Mouse",
        deadStockCount: deadStock.length,
      },
      inventorySummary: allInventory.map(item => ({
        name: item.name,
        stock: item.quantity,
        value: item.quantity * 120
      })).slice(0, 10),
      movementAnalysis: {
        fastMoving: allInventory.slice(0, 3).map(i => ({ name: i.name, movements: 45 })),
        slowMoving: allInventory.slice(3, 6).map(i => ({ name: i.name, movements: 2 })),
        deadStock: deadStock.map(i => ({ name: i.name, lastMoved: i.lastMovedAt?.toISOString() || 'Never' })),
      },
      valuationReport: [
        { category: 'Electronics', value: 1500000 },
        { category: 'Furniture', value: 800000 },
        { category: 'Stationery', value: 300000 },
      ]
    };
  }
}

export const storage = new DatabaseStorage();
