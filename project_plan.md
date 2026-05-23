# StockManagement — Stock Management & Delivery Web App

## 1. Project Description
StockManagement is a multi-warehouse stock management and delivery tracking platform. It supports BM Warehouse (Admin-managed) and Vendor Warehouses, with a full order lifecycle from vendor product creation to final delivery. Target users are admins, vendors, and logistics staff who need real-time inventory visibility, alert management, and delivery flow control.

## 2. Page Structure
- `/` — Dashboard (inventory overview, KPIs, alerts, quick actions)
- `/inventory` — Inventory Management (products, stock levels, adjustments)
- `/orders` — Orders (multi-vendor order flow, split orders, accept/reject)
- `/deliveries` — Delivery Tracking (status: Prepare → Ready → In Transit → Delivered)
- `/transfers` — Transfer Flow (Vendor → BM warehouse transfers)
- `/returns` — Returns (customer returns & BM → Vendor returns)
- `/purchases` — Purchase Orders (BM procurement flow)
- `/promotions` — Promotions (discount management)
- `/vendors` — Vendor Management
- `/warehouses` — Warehouse Management

## 3. Core Features
- [x] Dashboard: KPI cards, stock level overview, low-stock alerts, quick actions
- [ ] Inventory: Real-time stock levels, stock visibility control, adjustment history
- [ ] Orders: Multi-vendor order splitting, accept/reject flow, partial order handling
- [ ] Delivery: 4-step delivery status tracking, admin confirmation
- [ ] Transfers: Vendor→BM transfer with inventory update (vendor -qty, BM +qty)
- [ ] Returns: Customer returns & vendor returns with restock logic
- [ ] Purchase Orders: BM procurement with inventory update
- [ ] Promotions: Discount % with start/end date, auto-apply to price
- [ ] Vendors: Vendor profile management
- [ ] Warehouses: BM & Vendor warehouse inventory management

## 4. Data Model Design
(Mock data for Phase 1, Supabase integration planned for later phases)

### Products / Inventory
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique product ID |
| name | string | Product name |
| sku | string | SKU code |
| warehouse | string | BM or Vendor |
| stock | number | Current quantity |
| lowStockThreshold | number | Alert threshold |
| category | string | Product category |
| price | number | Unit price |

### Orders
| Field | Type | Description |
|-------|------|-------------|
| id | string | Order ID |
| status | string | pending/accepted/rejected/partial/fulfilled |
| vendors | array | List of vendor items in order |
| clientDecision | string | continue/cancel (for partial orders) |

### Deliveries
| Field | Type | Description |
|-------|------|-------------|
| id | string | Delivery ID |
| orderId | string | Linked order |
| status | string | prepare/ready/in_transit/delivered |
| assignedTo | string | Driver/courier |

## 5. Backend / Third-party Integration Plan
- Supabase: Auth, real-time data, RLS policies, triggers, edge functions
- Shopify: Not needed
- Stripe: Not needed

## 6. Data Tables
- `profiles` — user profiles with roles
- `notification_settings` — per-user notification preferences
- `notifications` — all notification records
- `alert_rules` — custom alert rule definitions
- `webhook_configs` — Slack/Discord/Telegram/custom webhook URLs
- `requirements` — system requirements tracking table (title, module, priority, status)
- `products`, `orders`, `returns`, `transfers`, `purchases`, `vendors`, `warehouses`, `promotions`, `deliveries` — core business tables
- `stock_history`, `activity_log`, `daily_revenue`, `monthly_snapshots`, `top_products`, `return_reasons`, `category_breakdown`, `warehouse_performance`, `vendor_performance` — analytics tables
- `notification_analytics` — aggregation view of notifications by day/type

## 7. Development Phase Plan

### Phase 1: Dashboard (Completed)
- KPI cards, stock alerts, quick actions, recent activity

### Phase 2: Inventory Management (Completed)
- Product CRUD, stock adjustment, history tracking

### Phase 3: Orders & Delivery (Completed)
- Multi-vendor order flow, delivery status tracking

### Phase 4: Transfers, Returns & Purchases (Completed)
- Transfer flow, return processing, purchase orders

### Phase 5: Vendors, Warehouses & Promotions (Completed)
- Vendor/warehouse management, promotion rules

### Phase 6: Supabase Integration (Completed)
- Live data, auth, role-based access, RLS policies, triggers

### Phase 7: Notification System (Completed)
- In-app notifications, email dispatch (Resend), SMS dispatch (Twilio)
- Webhook integrations (Slack, Discord, Telegram, custom)
- Custom alert rules engine with cron evaluation (every 10 min)
- Notification analytics dashboard with delivery/read rates
- Scheduled email/SMS dispatch (every 5 min)
- Database-level stock alert triggers on products table
- Requirements tracking table in Supabase

### Phase 8: Mobile UX (Completed)
- Mobile search overlay, swipe-to-close sidebar, bottom navigation, footer

### Phase 9: Pending Features
- [x] Browser push notifications — Service Worker, VAPID keys, push subscription storage, send-browser-push edge function
- [x] Real-time push via Service Worker when tab is not focused
- [x] Requirements management page for admin users