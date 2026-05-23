export type DeliveryStep = 'prepare' | 'ready' | 'in_transit' | 'delivered';

export interface DeliveryItem {
  productName: string;
  sku: string;
  quantity: number;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: DeliveryItem[];
  totalItems: number;
  status: DeliveryStep;
  carrier: string;
  trackingNumber: string;
  warehouse: string;
  estimatedDelivery: string;
  createdAt: string;
  timeline: { step: DeliveryStep; timestamp: string; note: string; completedBy?: string }[];
}

export const deliveryRecords: DeliveryRecord[] = [
  {
    id: 'DEL-001',
    orderId: 'ORD-2841',
    customer: 'Zara Mitchell',
    email: 'zara.mitchell@email.com',
    phone: '+60 12-345 6789',
    address: '45, Jalan Ampang',
    city: 'Kuala Lumpur, MY',
    totalItems: 3,
    items: [
      { productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', quantity: 2 },
      { productName: 'Webcam 4K Ultra HD', sku: 'WCM-008', quantity: 1 },
    ],
    status: 'in_transit',
    carrier: 'J&T Express',
    trackingNumber: 'JT-MY-20260519-4821',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-20',
    createdAt: '2026-05-19 09:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 09:00', note: 'Order picked and packed at BM Warehouse.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 10:30', note: 'Package ready for handoff to carrier.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-19 11:00', note: 'Picked up by J&T Express.', completedBy: 'J&T Express' },
    ],
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-2839',
    customer: 'Ahmed Al-Rashid',
    email: 'ahmed.rashid@email.com',
    phone: '+60 13-876 5432',
    address: '12, Persiaran Bestari',
    city: 'Shah Alam, MY',
    totalItems: 1,
    items: [
      { productName: 'LED Monitor 27 inch', sku: 'LMN-006', quantity: 1 },
    ],
    status: 'ready',
    carrier: 'Poslaju',
    trackingNumber: 'PJ-MY-20260519-1203',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-21',
    createdAt: '2026-05-19 08:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 08:00', note: 'Order packed and verified.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 09:30', note: 'Ready for carrier pickup.', completedBy: 'Admin' },
    ],
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-2838',
    customer: 'Priya Nair',
    email: 'priya.nair@email.com',
    phone: '+60 11-234 5678',
    address: '78, Jalan SS2/4',
    city: 'Petaling Jaya, MY',
    totalItems: 5,
    items: [
      { productName: 'Noise Cancelling Earbuds', sku: 'NCE-010', quantity: 2 },
      { productName: 'Portable Power Bank 20000mAh', sku: 'PPB-011', quantity: 2 },
      { productName: 'Laptop Cooling Pad', sku: 'LCP-007', quantity: 1 },
    ],
    status: 'delivered',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-MY-20260518-9905',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-19',
    createdAt: '2026-05-18 14:00',
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
    customer: 'Jason Tan',
    email: 'jason.tan@email.com',
    phone: '+60 17-654 3210',
    address: '22, Jalan USJ 9/5',
    city: 'Subang Jaya, MY',
    totalItems: 2,
    items: [
      { productName: 'Smart Home Hub Device', sku: 'SHH-012', quantity: 2 },
    ],
    status: 'prepare',
    carrier: 'GDex',
    trackingNumber: 'GDX-MY-20260519-0088',
    warehouse: 'Vendor Warehouse',
    estimatedDelivery: '2026-05-22',
    createdAt: '2026-05-19 11:20',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 11:20', note: 'Order received, preparing at Vendor Warehouse.', completedBy: 'SmartLife Corp.' },
    ],
  },
  {
    id: 'DEL-005',
    orderId: 'ORD-2842',
    customer: 'Nurul Huda',
    email: 'nurul.huda@email.com',
    phone: '+60 16-998 7654',
    address: '9, Jalan Cheras Perdana',
    city: 'Cheras, MY',
    totalItems: 4,
    items: [
      { productName: 'Mechanical Keyboard RGB', sku: 'MKR-004', quantity: 2 },
      { productName: 'Wireless Bluetooth Headphones', sku: 'WBH-001', quantity: 2 },
    ],
    status: 'in_transit',
    carrier: 'J&T Express',
    trackingNumber: 'JT-MY-20260519-5530',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-20',
    createdAt: '2026-05-19 09:30',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-19 09:30', note: 'Order packed and verified.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-19 10:00', note: 'Ready for dispatch.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-19 10:40', note: 'Out for delivery.', completedBy: 'J&T Express' },
    ],
  },
  {
    id: 'DEL-006',
    orderId: 'ORD-2836',
    customer: 'Linda Chong',
    email: 'linda.chong@email.com',
    phone: '+60 12-777 8899',
    address: '55, Jalan Klang Lama',
    city: 'Kuala Lumpur, MY',
    totalItems: 3,
    items: [
      { productName: 'Ergonomic Office Chair', sku: 'EOC-002', quantity: 1 },
      { productName: 'Desk Lamp LED Dimmable', sku: 'DLD-009', quantity: 2 },
    ],
    status: 'delivered',
    carrier: 'Poslaju',
    trackingNumber: 'PJ-MY-20260517-8843',
    warehouse: 'BM Warehouse',
    estimatedDelivery: '2026-05-18',
    createdAt: '2026-05-17 10:00',
    timeline: [
      { step: 'prepare', timestamp: '2026-05-17 10:00', note: 'Packed at BM Warehouse.', completedBy: 'Admin' },
      { step: 'ready', timestamp: '2026-05-17 12:00', note: 'Ready for dispatch.', completedBy: 'Admin' },
      { step: 'in_transit', timestamp: '2026-05-17 14:30', note: 'Courier collected.', completedBy: 'Poslaju' },
      { step: 'delivered', timestamp: '2026-05-18 11:00', note: 'Delivered. Signed by Linda.', completedBy: 'Admin' },
    ],
  },
];