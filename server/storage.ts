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

export interface IStorage {
  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
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
}

export class DatabaseStorage implements IStorage {
  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
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
    const allInventory = await this.getInventoryItems();
    
    const totalItems = allInventory.length;
    const lowStockItems = allInventory.filter(i => i.quantity <= i.minQuantity).length;
    const valuation = allInventory.reduce((acc, i) => acc + (i.quantity * 10), 0); // Dummy valuation multiplier

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
      totalInwardToday: 12, // Dummy for demo
      totalOutwardToday: 8, // Dummy for demo
      valuation,
      inventoryByCategory,
      weeklyActivity
    };
  }
}

export const storage = new DatabaseStorage();
