import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertInventoryItemSchema, insertInwardEntrySchema, insertOutwardEntrySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Inventory Routes
  app.get(api.inventory.list.path, async (req, res) => {
    const items = await storage.getInventoryItems();
    res.json(items);
  });

  app.post(api.inventory.create.path, async (req, res) => {
    try {
      const input = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.inventory.get.path, async (req, res) => {
    const item = await storage.getInventoryItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  });

  app.put(api.inventory.update.path, async (req, res) => {
    try {
      const input = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Inward Routes
  app.get(api.inward.list.path, async (req, res) => {
    const entries = await storage.getInwardEntries();
    res.json(entries);
  });

  app.post(api.inward.create.path, async (req, res) => {
    try {
      const input = insertInwardEntrySchema.parse(req.body);
      const entry = await storage.createInwardEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Outward Routes
  app.get(api.outward.list.path, async (req, res) => {
    const entries = await storage.getOutwardEntries();
    res.json(entries);
  });

  app.post(api.outward.create.path, async (req, res) => {
    try {
      const input = insertOutwardEntrySchema.parse(req.body);
      const entry = await storage.createOutwardEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Stats
  app.get(api.stats.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const inventory = await storage.getInventoryItems();
  if (inventory.length === 0) {
    console.log("Seeding database...");
    
    // Seed Inventory
    const items = [
      { sku: 'EL001', name: 'Wireless Mouse', category: 'Electronics', location: 'Rack A1', quantity: 50, minQuantity: 10 },
      { sku: 'EL002', name: 'Mechanical Keyboard', category: 'Electronics', location: 'Rack A2', quantity: 30, minQuantity: 5 },
      { sku: 'EL003', name: 'Monitor 24"', category: 'Electronics', location: 'Rack A3', quantity: 15, minQuantity: 5 },
      { sku: 'FU001', name: 'Office Chair', category: 'Furniture', location: 'Zone B', quantity: 20, minQuantity: 5 },
      { sku: 'FU002', name: 'Desk Lamp', category: 'Furniture', location: 'Zone B', quantity: 40, minQuantity: 10 },
      { sku: 'ST001', name: 'Notebook A5', category: 'Stationery', location: 'Shelf C1', quantity: 100, minQuantity: 20 },
      { sku: 'ST002', name: 'Ballpoint Pen Box', category: 'Stationery', location: 'Shelf C2', quantity: 200, minQuantity: 50 },
      { sku: 'EL004', name: 'USB-C Cable', category: 'Electronics', location: 'Rack A1', quantity: 80, minQuantity: 20 },
      { sku: 'EL005', name: 'Power Strip', category: 'Electronics', location: 'Rack A4', quantity: 25, minQuantity: 5 },
      { sku: 'FU003', name: 'Filing Cabinet', category: 'Furniture', location: 'Zone B', quantity: 5, minQuantity: 2 },
    ];
    
    const createdItems = [];
    for (const item of items) {
      createdItems.push(await storage.createInventoryItem(item));
    }

    // Seed Inward
    await storage.createInwardEntry({
      grnNo: 'GRN-2023-001',
      supplier: 'Tech Supplies Inc',
      status: 'Received',
      items: [{ itemId: createdItems[0].id, quantity: 20 }, { itemId: createdItems[1].id, quantity: 10 }],
      totalItems: 30,
      date: new Date('2023-10-01')
    });

    await storage.createInwardEntry({
      grnNo: 'GRN-2023-002',
      supplier: 'Office Depot',
      status: 'Stored',
      items: [{ itemId: createdItems[5].id, quantity: 50 }],
      totalItems: 50,
      date: new Date('2023-10-05')
    });

    // Seed Outward
    await storage.createOutwardEntry({
      dispatchNo: 'DSP-2023-001',
      customer: 'Acme Corp',
      status: 'Dispatched',
      items: [{ itemId: createdItems[0].id, quantity: 5 }],
      totalItems: 5,
      date: new Date('2023-10-03')
    });

    console.log("Database seeded successfully.");
  }
}
