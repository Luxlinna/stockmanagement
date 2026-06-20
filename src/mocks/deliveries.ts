export type DeliveryStep = 'prepare' | 'ready' | 'in_transit' | 'delivered';

export interface DeliveryItem {
  productName: string;
  sku: string;
  quantity: number;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  destination: string;
  items: DeliveryItem[];
  items_detail: string;
  status: DeliveryStep;
  warehouse: string;
  estimatedDelivery: string;
  timeline: { step: DeliveryStep; timestamp: string; note: string; completedBy?: string }[];
  last_update: string;
  created_at: string;
  transfer_id?: string;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
  driver_name?: string;
  vehicle_plate?: string;
  departure_time?: string;
  arrival_time?: string;
  imageUrl?: string;
}

export const deliveryRecords: DeliveryRecord[] = [
  {
    id: 'DEL-001',
    orderId: 'ORD-2841',
    destination: 'Zara Mitchell',
    items_detail: '2x Wireless Bluetooth Headphones, 1x Webcam 4K Ultra HD',
    items: [
      { productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', quantity: 2 },
      { productName: 'Webcam 4K Ultra HD', sku: 'WCM-008', quantity: 1 },
    ],
    status: 'in_transit',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-20',
    created_at: '2026-05-19 09:00',
    last_update: '2026-05-19 11:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 09:00', note: 'Order picked and packed at BM Warehouse.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 10:30', note: 'Package ready for handoff to carrier.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-19 11:00', note: 'Picked up by J&T Express.', completedBy: 'J&T Express' },
    ],
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-2839',
    destination: 'Ahmed Al-Rashid',
    items_detail: '1x LED Monitor 27 inch',
    items: [
      { productName: 'LED Monitor 27 inch', sku: 'LMN-006', quantity: 1 },
    ],
    status: 'ready',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-21',
    created_at: '2026-05-19 08:00',
    last_update: '2026-05-19 09:30',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 08:00', note: 'Order packed and verified.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 09:30', note: 'Ready for carrier pickup.', completedBy: 'Admin' },
    ],
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-2838',
    destination: 'Priya Nair',
    items_detail: '3x Noise Cancelling Earbuds, 2x Portable Power Bank 20000mAh, 1x Laptop Cooling Pad',
    items: [
      { productName: 'Noise Cancelling Earbuds', sku: 'NCE-010', quantity: 3 },
      { productName: 'Portable Power Bank 20000mAh', sku: 'PPB-011', quantity: 2 },
      { productName: 'Laptop Cooling Pad', sku: 'LCP-007', quantity: 1 },
    ],
    status: 'delivered',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-19',
    created_at: '2026-05-18 14:00',
    last_update: '2026-05-19 16:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-18 14:00', note: 'Items picked from BM + Vendor Warehouse.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-18 16:00', note: 'Consolidated and ready.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-18 17:30', note: 'DHL Express picked up parcel.', completedBy: 'DHL Express' },
      { step: 'delivered', timestamp: '2026-05-19 08:45', note: 'Delivered successfully. Signed by recipient.', completedBy: 'Admin' },
    ],
  },
  {
    id: 'DEL-004',
    orderId: 'ORD-2843',
    destination: 'Jason Tan',
    items_detail: '3x Noise Cancelling Earbuds, 2x Portable Power Bank 20000mAh, 1x Laptop Cooling Pad',
    items: [
      { productName: 'Smart Home Hub Device', sku: 'SHH-012', quantity: 2 },
    ],
    status: 'prepare',
    warehouse: 'Vendor Warehouse',
    estimatedDelivery: '2026-05-22',
    created_at: '2026-05-19 11:20',
    last_update: '2026-05-19 11:20',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 11:20', note: 'Order received, preparing at Vendor Warehouse.', completedBy: 'SmartLife Corp.' },
    ],
  },
  {
    id: 'DEL-005',
    orderId: 'ORD-2842',
    destination: 'Nurul Huda',
    items_detail: '2x Mechanical Keyboard RGB, 2x Wireless Bluetooth Headphones',
    items: [
      { productName: 'Mechanical Keyboard RGB', sku: 'MKR-004', quantity: 2 },
      { productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', quantity: 2 },
    ],
    status: 'in_transit',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-20',
    created_at: '2026-05-19 09:30',
    last_update: '2026-05-19 10:40',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 09:30', note: 'Order packed and verified.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 10:00', note: 'Ready for dispatch.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-19 10:40', note: 'Out for delivery.', completedBy: 'J&T Express' },
    ],
  },
  {
    id: 'DEL-006',
    orderId: 'ORD-2836',
    destination: 'Linda Chong',
    items_detail: '1x Ergonomic Office Chair, 2x Desk Lamp LED Dimmable',
    items: [
      { productName: 'Mechanical Keyboard RGB', sku: 'MKR-004', quantity: 2 },
      { productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', quantity: 2 },
    ],
    status: 'delivered',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-18',
    created_at: '2026-05-17 10:00',
    last_update: '2026-05-18 11:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-17 10:00', note: 'Packed at BM Warehouse.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-17 12:00', note: 'Ready for dispatch.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-17 14:30', note: 'Courier collected.', completedBy: 'Poslaju' },
      { step: 'delivered', timestamp: '2026-05-18 11:00', note: 'Delivered. Signed by Linda.', completedBy: 'Admin' },
    ],
  },
];