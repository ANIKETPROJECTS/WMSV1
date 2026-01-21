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
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const items = await storage.getInventoryItems(search, status);
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

  app.get(api.stats.mis.path, async (req, res) => {
    const stats = await storage.getMISStats();
    res.json(stats);
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const inventory = await storage.getInventoryItems();
  if (inventory.length <= 10) {
    console.log("Seeding additional database records...");
    
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
      { sku: 'EL006', name: 'Laptop Stand', category: 'Electronics', location: 'Rack A5', quantity: 12, minQuantity: 5 },
      { sku: 'EL007', name: 'Webcam 1080p', category: 'Electronics', location: 'Rack A2', quantity: 8, minQuantity: 10 },
      { sku: 'FU004', name: 'Standing Desk', category: 'Furniture', location: 'Zone B', quantity: 3, minQuantity: 5 },
      { sku: 'ST003', name: 'Stapler Heavy Duty', category: 'Stationery', location: 'Shelf C3', quantity: 15, minQuantity: 5 },
      { sku: 'ST004', name: 'Printer Paper Reams', category: 'Stationery', location: 'Shelf C4', quantity: 45, minQuantity: 20 },
      { sku: 'EL008', name: 'HDMI Cable 3m', category: 'Electronics', location: 'Rack A1', quantity: 60, minQuantity: 15 },
      { sku: 'FU005', name: 'Bookshelf Large', category: 'Furniture', location: 'Zone D', quantity: 4, minQuantity: 2 },
      { sku: 'EL009', name: 'External SSD 1TB', category: 'Electronics', location: 'Vault 1', quantity: 22, minQuantity: 10 },
      { sku: 'EL010', name: 'Bluetooth Speaker', category: 'Electronics', location: 'Rack A4', quantity: 18, minQuantity: 5 },
      { sku: 'ST005', name: 'Whiteboard Markers', category: 'Stationery', location: 'Shelf C1', quantity: 120, minQuantity: 30 },
    ];
    
    const createdItems = [];
    for (const item of items) {
      const existing = inventory.find(i => i.sku === item.sku);
      if (!existing) {
        createdItems.push(await storage.createInventoryItem(item));
      } else {
        createdItems.push(existing);
      }
    }

    // Seed more Inward/Outward if needed
    const inwards = await storage.getInwardEntries();
    if (inwards.length < 5) {
      await storage.createInwardEntry({
        grnNo: 'GRN-2024-001',
        supplier: 'Global Tech Distro',
        status: 'Received',
        items: [{ itemId: createdItems[8].id, quantity: 15 }, { itemId: createdItems[9].id, quantity: 5 }],
        totalItems: 20,
        date: new Date()
      });
      await storage.createInwardEntry({
        grnNo: 'GRN-2024-002',
        supplier: 'Premium Furniture Ltd',
        status: 'Stored',
        items: [{ itemId: createdItems[12].id, quantity: 5 }],
        totalItems: 5,
        date: new Date()
      });
    }

    const outwards = await storage.getOutwardEntries();
    if (outwards.length < 5) {
      await storage.createOutwardEntry({
        dispatchNo: 'DSP-2024-001',
        customer: 'Regional Office East',
        status: 'Packed',
        items: [{ itemId: createdItems[14].id, quantity: 10 }],
        totalItems: 10,
        date: new Date()
      });
    }

    console.log("Database records expanded successfully.");
  }
}
