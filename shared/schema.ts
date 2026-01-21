import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(), // Rack/Bin
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inwardEntries = pgTable("inward_entries", {
  id: serial("id").primaryKey(),
  grnNo: text("grn_no").notNull().unique(),
  supplier: text("supplier").notNull(),
  date: timestamp("date").defaultNow(),
  status: text("status").notNull(), // Received, QC Pending, Stored
  items: jsonb("items").$type<{ itemId: number; quantity: number }[]>().notNull(), // Store items as JSON for simplicity in demo
  totalItems: integer("total_items").notNull(),
});

export const outwardEntries = pgTable("outward_entries", {
  id: serial("id").primaryKey(),
  dispatchNo: text("dispatch_no").notNull().unique(),
  customer: text("customer").notNull(),
  date: timestamp("date").defaultNow(),
  status: text("status").notNull(), // Packed, Dispatched, Delivered
  items: jsonb("items").$type<{ itemId: number; quantity: number }[]>().notNull(),
  totalItems: integer("total_items").notNull(),
});

// === SCHEMAS ===

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true });
export const insertInwardEntrySchema = createInsertSchema(inwardEntries).omit({ id: true });
export const insertOutwardEntrySchema = createInsertSchema(outwardEntries).omit({ id: true });

// === TYPES ===

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InwardEntry = typeof inwardEntries.$inferSelect;
export type InsertInwardEntry = z.infer<typeof insertInwardEntrySchema>;

export type OutwardEntry = typeof outwardEntries.$inferSelect;
export type InsertOutwardEntry = z.infer<typeof insertOutwardEntrySchema>;

export type InventoryStats = {
  totalItems: number;
  lowStockItems: number;
  totalInwardToday: number;
  totalOutwardToday: number;
  valuation: number;
};
