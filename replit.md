# NexWMS - Warehouse Management System

## Overview

NexWMS is a full-stack Warehouse Management System (WMS) built with React, Express, and PostgreSQL. The application provides a responsive UI for managing warehouse operations including inward goods receipt, outward dispatch, inventory tracking, and MIS reporting with analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Charts**: Recharts for data visualization on dashboard and reports
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based structure with shared components:
- `/client/src/pages/` - Page components (Login, Dashboard, Inventory, Inward, Outward, Reports)
- `/client/src/components/` - Reusable UI components including Layout wrapper
- `/client/src/hooks/` - Custom hooks for data fetching (use-inventory, use-inward, use-outward, use-stats)

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in `/shared/routes.ts` with Zod schema validation
- **Type Safety**: Shared types between frontend and backend via `/shared/schema.ts`

The backend uses a storage abstraction pattern:
- `server/storage.ts` - Database operations interface
- `server/routes.ts` - API endpoint handlers
- `server/db.ts` - Database connection pool

### Data Model
Three main entities stored in PostgreSQL:
1. **inventoryItems** - SKU, name, category, location (rack/bin), quantity, minimum quantity thresholds
2. **inwardEntries** - GRN number, supplier, items (JSON), status (Received/QC Pending/Stored)
3. **outwardEntries** - Dispatch number, customer, items (JSON), status (Packed/Dispatched/Delivered)

### Build System
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: Custom build script using esbuild for server bundling and Vite for client
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage (available but sessions not currently implemented)

### UI Components
- **Radix UI**: Accessible primitives for dialogs, dropdowns, forms, and other interactive elements
- **shadcn/ui**: Pre-built component library configured via `components.json`
- **Lucide React**: Icon library

### Data Visualization
- **Recharts**: Bar charts and pie charts for dashboard analytics

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation shared between client and server
- **drizzle-zod**: Auto-generates Zod schemas from Drizzle table definitions

### Fonts
- Inter (sans-serif) - Body text
- Space Grotesk (display) - Headings and branding