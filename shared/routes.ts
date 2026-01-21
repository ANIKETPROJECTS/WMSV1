import { z } from 'zod';
import { 
  insertInventoryItemSchema, 
  insertInwardEntrySchema, 
  insertOutwardEntrySchema,
  inventoryItems,
  inwardEntries,
  outwardEntries
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/inventory',
      input: z.object({
        search: z.string().optional(),
        status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof inventoryItems.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inventory',
      input: insertInventoryItemSchema,
      responses: {
        201: z.custom<typeof inventoryItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/inventory/:id',
      responses: {
        200: z.custom<typeof inventoryItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/inventory/:id',
      input: insertInventoryItemSchema.partial(),
      responses: {
        200: z.custom<typeof inventoryItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  inward: {
    list: {
      method: 'GET' as const,
      path: '/api/inward',
      responses: {
        200: z.array(z.custom<typeof inwardEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inward',
      input: insertInwardEntrySchema,
      responses: {
        201: z.custom<typeof inwardEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  outward: {
    list: {
      method: 'GET' as const,
      path: '/api/outward',
      responses: {
        200: z.array(z.custom<typeof outwardEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/outward',
      input: insertOutwardEntrySchema,
      responses: {
        201: z.custom<typeof outwardEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard',
      responses: {
        200: z.object({
          totalItems: z.number(),
          lowStockItems: z.number(),
          totalInwardToday: z.number(),
          totalOutwardToday: z.number(),
          valuation: z.number(),
          inventoryByCategory: z.array(z.object({ name: z.string(), value: z.number() })),
          weeklyActivity: z.array(z.object({ name: z.string(), inward: z.number(), outward: z.number() })),
        }),
      },
    },
    mis: {
      method: 'GET' as const,
      path: '/api/stats/mis',
      responses: {
        200: z.object({
          dailyStats: z.object({
            totalInwardValuation: z.number(),
            totalOutwardValuation: z.number(),
            topItem: z.string(),
            deadStockCount: z.number(),
          }),
          inventorySummary: z.array(z.object({ name: z.string(), stock: z.number(), value: z.number() })),
          movementAnalysis: z.object({
            fastMoving: z.array(z.object({ name: z.string(), movements: z.number() })),
            slowMoving: z.array(z.object({ name: z.string(), movements: z.number() })),
            deadStock: z.array(z.object({ name: z.string(), lastMoved: z.string() })),
          }),
          valuationReport: z.array(z.object({ category: z.string(), value: z.number() })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
