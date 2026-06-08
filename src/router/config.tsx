import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/feature/ProtectedRoute";
import NotFound from "../pages/NotFound";
import UnauthorizedPage from "../pages/unauthorized/page";
import LoginPage from "../pages/login/page";
import SignupPage from "../pages/signup/page";
import Home from "../pages/home/page";
import InventoryPage from "../pages/inventory/page";
import OrdersPage from "../pages/orders/page";
import DeliveriesPage from "../pages/deliveries/page";
import TransfersPage from "../pages/transfers/page";
import PurchasesPage from "../pages/purchases/page";
import VendorsPage from "../pages/vendors/page";
import ReturnsPage from "../pages/returns/page";
import WarehousesPage from "../pages/warehouses/page";
import PromotionsPage from "../pages/promotions/page";
import TeamsPage from "../pages/teams/page";
import NotificationAnalyticsPage from "../pages/notifications/analytics/page";
import NotificationSettingsPage from "../pages/notifications/settings/page";
import NotificationHistoryPage from "../pages/notifications/history/page";
import ReportsPage from "../pages/reports/page";
import RequirementsPage from "../pages/requirements/page";

// ── Role access matrix ────────────────────────────────────────────
// admin  → full access
// staff  → operational pages (no reports, no team management)
// viewer → read-only overview (dashboard, inventory, orders, deliveries,
//           warehouses, reports — no writes, no team/notification management)

const ALL   = ['admin', 'staff', 'viewer'] as const;
const STAFF = ['admin', 'staff']           as const;
const ADMIN = ['admin']                    as const;
const REPORTS = ['admin', 'viewer']        as const;

const routes: RouteObject[] = [
  // Public routes
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // All authenticated roles
  { path: '/',          element: <ProtectedRoute roles={[...ALL]}><Home /></ProtectedRoute> },
  { path: '/inventory', element: <ProtectedRoute roles={[...ALL]}><InventoryPage /></ProtectedRoute> },
  { path: '/orders',    element: <ProtectedRoute roles={[...ALL]}><OrdersPage /></ProtectedRoute> },
  { path: '/deliveries',element: <ProtectedRoute roles={[...ALL]}><DeliveriesPage /></ProtectedRoute> },
  { path: '/warehouses',element: <ProtectedRoute roles={[...ALL]}><WarehousesPage /></ProtectedRoute> },

  // Admin + viewer (analytics / read-heavy)
  { path: '/reports', element: <ProtectedRoute roles={[...REPORTS]}><ReportsPage /></ProtectedRoute> },

  // Admin + staff (operational write access)
  { path: '/transfers', element: <ProtectedRoute roles={[...STAFF]}><TransfersPage /></ProtectedRoute> },
  { path: '/returns',   element: <ProtectedRoute roles={[...STAFF]}><ReturnsPage /></ProtectedRoute> },
  { path: '/purchases', element: <ProtectedRoute roles={[...STAFF]}><PurchasesPage /></ProtectedRoute> },
  { path: '/vendors',   element: <ProtectedRoute roles={[...STAFF]}><VendorsPage /></ProtectedRoute> },
  { path: '/promotions',element: <ProtectedRoute roles={[...STAFF]}><PromotionsPage /></ProtectedRoute> },
  { path: '/notifications/history',  element: <ProtectedRoute roles={[...STAFF]}><NotificationHistoryPage /></ProtectedRoute> },
  { path: '/notifications/settings', element: <ProtectedRoute roles={[...STAFF]}><NotificationSettingsPage /></ProtectedRoute> },

  // Admin only
  { path: '/teams',        element: <ProtectedRoute roles={[...ADMIN]}><TeamsPage /></ProtectedRoute> },
  { path: '/requirements', element: <ProtectedRoute roles={[...ADMIN]}><RequirementsPage /></ProtectedRoute> },
  { path: '/notifications/analytics', element: <ProtectedRoute roles={[...ADMIN]}><NotificationAnalyticsPage /></ProtectedRoute> },

  { path: '*', element: <NotFound /> },
];

export default routes;
