import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/login/page";
import SignupPage from "../pages/signup/page";
import Home from "../pages/home/page";
import InventoryPage from "../pages/inventory/page";
import OrdersPage from "../pages/orders/page";
import PublicOrderFormPage from "../pages/order-form/page";
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
import CategoriesPage from "../pages/categories/page";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
  },
  {
    path: "/categories",
    element: <CategoriesPage />,
  },
  {
    path: "/orders",
    element: <OrdersPage />,
  },
  {
    path: "/order-form",
    element: <PublicOrderFormPage />,
  },
  {
    path: "/deliveries",
    element: <DeliveriesPage />,
  },
  {
    path: "/transfers",
    element: <TransfersPage />,
  },
  {
    path: "/purchases",
    element: <PurchasesPage />,
  },
  {
    path: "/vendors",
    element: <VendorsPage />,
  },
  {
    path: "/returns",
    element: <ReturnsPage />,
  },
  {
    path: "/warehouses",
    element: <WarehousesPage />,
  },
  {
    path: "/promotions",
    element: <PromotionsPage />,
  },
  {
    path: "/notifications/settings",
    element: <NotificationSettingsPage />,
  },
  {
    path: "/notifications/history",
    element: <NotificationHistoryPage />,
  },
  {
    path: "/notifications/analytics",
    element: <NotificationAnalyticsPage />,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
  },
  {
    path: "/teams",
    element: <TeamsPage />,
  },
  {
    path: "/requirements",
    element: <RequirementsPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
