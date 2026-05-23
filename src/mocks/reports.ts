export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  returns: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  returnRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  unitsSold: number;
  returnRate: number;
  color: string;
}

export interface MonthlySnapshot {
  month: string;
  revenue: number;
  orders: number;
  returns: number;
  transfers: number;
  purchases: number;
  avgOrderValue: number;
}

export interface ReturnReasonBreakdown {
  reason: string;
  count: number;
  value: number;
  percentage: number;
}

export interface WarehousePerformance {
  warehouse: string;
  inbound: number;
  outbound: number;
  returns: number;
  fulfillmentRate: number;
  avgProcessingDays: number;
}

export interface VendorPerformance {
  vendor: string;
  fulfillmentRate: number;
  totalOrders: number;
  rejectedOrders: number;
  avgDeliveryDays: number;
  revenue: number;
}

export const dailyRevenue: DailyRevenue[] = [
  { date: 'May 1', revenue: 3240, orders: 14, returns: 1 },
  { date: 'May 2', revenue: 4120, orders: 18, returns: 2 },
  { date: 'May 3', revenue: 2980, orders: 12, returns: 0 },
  { date: 'May 4', revenue: 5640, orders: 24, returns: 3 },
  { date: 'May 5', revenue: 6210, orders: 27, returns: 2 },
  { date: 'May 6', revenue: 4880, orders: 21, returns: 1 },
  { date: 'May 7', revenue: 3560, orders: 15, returns: 2 },
  { date: 'May 8', revenue: 5120, orders: 22, returns: 1 },
  { date: 'May 9', revenue: 4790, orders: 20, returns: 3 },
  { date: 'May 10', revenue: 6840, orders: 29, returns: 2 },
  { date: 'May 11', revenue: 7230, orders: 31, returns: 4 },
  { date: 'May 12', revenue: 5980, orders: 25, returns: 2 },
  { date: 'May 13', revenue: 4540, orders: 19, returns: 1 },
  { date: 'May 14', revenue: 6780, orders: 29, returns: 3 },
  { date: 'May 15', revenue: 8120, orders: 35, returns: 4 },
  { date: 'May 16', revenue: 7640, orders: 33, returns: 2 },
  { date: 'May 17', revenue: 6900, orders: 30, returns: 3 },
  { date: 'May 18', revenue: 8450, orders: 36, returns: 5 },
  { date: 'May 19', revenue: 9210, orders: 40, returns: 3 },
];

export const topProducts: TopProduct[] = [
  { productId: 'P001', productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', category: 'Electronics', unitsSold: 312, revenue: 28076.88, returnRate: 2.1, trend: 'up' },
  { productId: 'P010', productName: 'Noise Cancelling Earbuds', sku: 'NCE-010', category: 'Electronics', unitsSold: 287, revenue: 21523.13, returnRate: 1.4, trend: 'up' },
  { productId: 'P006', productName: 'LED Monitor 27 inch', sku: 'LMN-006', category: 'Electronics', unitsSold: 198, revenue: 55242.00, returnRate: 3.5, trend: 'stable' },
  { productId: 'P004', productName: 'Mechanical Keyboard RGB', sku: 'MKR-004', category: 'Electronics', unitsSold: 174, revenue: 22612.26, returnRate: 1.2, trend: 'up' },
  { productId: 'P012', productName: 'Smart Home Hub Device', sku: 'SHH-012', category: 'Smart Home', unitsSold: 143, revenue: 14157.00, returnRate: 0.7, trend: 'up' },
  { productId: 'P002', productName: 'Ergonomic Office Chair', sku: 'EOC-002', category: 'Furniture', unitsSold: 132, revenue: 46068.00, returnRate: 5.3, trend: 'down' },
  { productId: 'P008', productName: 'Webcam 4K Ultra HD', sku: 'WCM-008', category: 'Electronics', unitsSold: 128, revenue: 20478.72, returnRate: 2.3, trend: 'stable' },
  { productId: 'P011', productName: 'Portable Power Bank 20000mAh', sku: 'PPB-011', category: 'Accessories', unitsSold: 115, revenue: 6898.85, returnRate: 4.2, trend: 'down' },
  { productId: 'P003', productName: 'USB-C Charging Cable 2m', sku: 'UCC-003', category: 'Accessories', unitsSold: 108, revenue: 1402.92, returnRate: 8.1, trend: 'down' },
  { productId: 'P005', productName: 'Standing Desk Converter', sku: 'SDC-005', category: 'Furniture', unitsSold: 89, revenue: 17755.50, returnRate: 3.7, trend: 'stable' },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Electronics', revenue: 147932.99, unitsSold: 1099, returnRate: 2.1, color: '#10b981' },
  { category: 'Furniture', revenue: 63823.50, unitsSold: 221, returnRate: 4.5, color: '#f59e0b' },
  { category: 'Accessories', revenue: 9762.27, unitsSold: 388, returnRate: 5.2, color: '#6366f1' },
  { category: 'Smart Home', revenue: 14157.00, unitsSold: 143, returnRate: 0.7, color: '#14b8a6' },
  { category: 'Lighting', revenue: 2499.50, unitsSold: 50, returnRate: 2.0, color: '#f97316' },
];

export const monthlySnapshots: MonthlySnapshot[] = [
  { month: 'Jan', revenue: 68400, orders: 290, returns: 18, transfers: 12, purchases: 8, avgOrderValue: 235.86 },
  { month: 'Feb', revenue: 54200, orders: 231, returns: 12, transfers: 9, purchases: 6, avgOrderValue: 234.63 },
  { month: 'Mar', revenue: 82100, orders: 348, returns: 24, transfers: 15, purchases: 11, avgOrderValue: 235.92 },
  { month: 'Apr', revenue: 97400, orders: 412, returns: 31, transfers: 18, purchases: 14, avgOrderValue: 236.41 },
  { month: 'May', revenue: 112300, orders: 470, returns: 36, transfers: 22, purchases: 16, avgOrderValue: 238.94 },
];

export const returnReasonBreakdown: ReturnReasonBreakdown[] = [
  { reason: 'Defective Product', count: 38, value: 3240.50, percentage: 34.9 },
  { reason: 'Damaged on Arrival', count: 24, value: 7890.00, percentage: 22.0 },
  { reason: 'Wrong Item Shipped', count: 18, value: 1450.20, percentage: 16.5 },
  { reason: 'Changed Mind', count: 15, value: 4320.80, percentage: 13.8 },
  { reason: 'Not As Described', count: 10, value: 890.40, percentage: 9.2 },
  { reason: 'Other', count: 4, value: 210.00, percentage: 3.7 },
];

export const warehousePerformance: WarehousePerformance[] = [
  { warehouse: 'BM Warehouse', inbound: 1960, outbound: 2390, returns: 97, fulfillmentRate: 94.2, avgProcessingDays: 1.2 },
  { warehouse: 'Vendor Warehouse', inbound: 1210, outbound: 1500, returns: 59, fulfillmentRate: 88.7, avgProcessingDays: 2.1 },
];

export const vendorPerformance: VendorPerformance[] = [
  { vendor: 'SoundWave Co.', fulfillmentRate: 100.0, totalOrders: 22, rejectedOrders: 0, avgDeliveryDays: 2.8, revenue: 89400 },
  { vendor: 'SmartLife Corp.', fulfillmentRate: 100.0, totalOrders: 9, rejectedOrders: 0, avgDeliveryDays: 3.5, revenue: 41800 },
  { vendor: 'CoolTech Inc.', fulfillmentRate: 91.7, totalOrders: 12, rejectedOrders: 0, avgDeliveryDays: 4.1, revenue: 15200 },
  { vendor: 'ErgoWorks Ltd.', fulfillmentRate: 86.7, totalOrders: 15, rejectedOrders: 1, avgDeliveryDays: 6.8, revenue: 67300 },
  { vendor: 'TechSupply Co.', fulfillmentRate: 85.7, totalOrders: 28, rejectedOrders: 2, avgDeliveryDays: 3.2, revenue: 38450 },
  { vendor: 'GlobalGear Supply', fulfillmentRate: 60.0, totalOrders: 5, rejectedOrders: 2, avgDeliveryDays: 10.2, revenue: 9800 },
];