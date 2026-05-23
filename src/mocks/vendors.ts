export interface VendorContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface VendorProduct {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  unitCost: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface VendorMetrics {
  totalOrders: number;
  fulfilledOrders: number;
  rejectedOrders: number;
  fulfillmentRate: number;
  avgDeliveryDays: number;
  totalPurchaseValue: number;
  lastOrderDate: string;
  onTimeDeliveryRate: number;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'supplier' | 'manufacturer' | 'distributor';
  status: 'active' | 'inactive' | 'suspended';
  logo?: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  registeredAt: string;
  contacts: VendorContact[];
  products: VendorProduct[];
  metrics: VendorMetrics;
  tags: string[];
  paymentTerms: string;
  notes?: string;
}

export const vendors: Vendor[] = [
  {
    id: 'V001',
    name: 'TechSupply Co.',
    type: 'distributor',
    status: 'active',
    address: '18, Jalan Teknologi, Taman Sains Selangor',
    city: 'Shah Alam',
    country: 'Malaysia',
    website: 'www.techsupply.co',
    registeredAt: '2024-03-15',
    paymentTerms: 'Net 30',
    tags: ['Electronics', 'Accessories', 'Priority'],
    notes: 'Primary accessories distributor. Fast turnaround for small orders.',
    contacts: [
      { name: 'Kevin Lam', role: 'Account Manager', email: 'kevin@techsupply.co', phone: '+60 12-888 9900' },
      { name: 'Lisa Wong', role: 'Logistics', email: 'lisa@techsupply.co', phone: '+60 11-777 6600' },
    ],
    products: [
      { productId: 'P003', productName: 'USB-C Charging Cable 2m', sku: 'UCC-003', category: 'Accessories', currentStock: 0, lowStockThreshold: 50, unitCost: 12.99, status: 'out_of_stock' },
    ],
    metrics: {
      totalOrders: 28,
      fulfilledOrders: 24,
      rejectedOrders: 2,
      fulfillmentRate: 85.7,
      avgDeliveryDays: 3.2,
      totalPurchaseValue: 38450.00,
      lastOrderDate: '2026-05-19',
      onTimeDeliveryRate: 91.7,
    },
  },
  {
    id: 'V002',
    name: 'ErgoWorks Ltd.',
    type: 'manufacturer',
    status: 'active',
    address: '7, Persiaran Industri, Bandar Sri Damansara',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    website: 'www.ergoworks.com',
    registeredAt: '2023-11-20',
    paymentTerms: 'Net 45',
    tags: ['Furniture', 'Ergonomics', 'Bulk Orders'],
    notes: 'Handles large furniture orders well. Longer lead times for custom pieces.',
    contacts: [
      { name: 'Sandra Ng', role: 'Sales Director', email: 'sandra@ergoworks.com', phone: '+60 13-444 5566' },
    ],
    products: [
      { productId: 'P002', productName: 'Ergonomic Office Chair', sku: 'EOC-002', category: 'Furniture', currentStock: 8, lowStockThreshold: 15, unitCost: 280.00, status: 'low_stock' },
      { productId: 'P005', productName: 'Standing Desk Converter', sku: 'SDC-005', category: 'Furniture', currentStock: 3, lowStockThreshold: 10, unitCost: 168.75, status: 'low_stock' },
    ],
    metrics: {
      totalOrders: 15,
      fulfilledOrders: 13,
      rejectedOrders: 1,
      fulfillmentRate: 86.7,
      avgDeliveryDays: 6.8,
      totalPurchaseValue: 67300.00,
      lastOrderDate: '2026-05-18',
      onTimeDeliveryRate: 80.0,
    },
  },
  {
    id: 'V003',
    name: 'CoolTech Inc.',
    type: 'supplier',
    status: 'active',
    address: '22, Jalan PJU 1A/46, Ara Damansara',
    city: 'Petaling Jaya',
    country: 'Malaysia',
    website: 'www.cooltech.io',
    registeredAt: '2025-01-08',
    paymentTerms: 'Net 30',
    tags: ['Accessories', 'Cooling'],
    contacts: [
      { name: 'Raj Patel', role: 'Operations Manager', email: 'raj@cooltech.io', phone: '+60 17-321 0011' },
      { name: 'Amy Lee', role: 'Finance', email: 'amy@cooltech.io', phone: '+60 17-321 0022' },
    ],
    products: [
      { productId: 'P007', productName: 'Laptop Cooling Pad', sku: 'LCP-007', category: 'Accessories', currentStock: 5, lowStockThreshold: 20, unitCost: 17.50, status: 'low_stock' },
    ],
    metrics: {
      totalOrders: 12,
      fulfilledOrders: 11,
      rejectedOrders: 0,
      fulfillmentRate: 91.7,
      avgDeliveryDays: 4.1,
      totalPurchaseValue: 15200.00,
      lastOrderDate: '2026-05-17',
      onTimeDeliveryRate: 100.0,
    },
  },
  {
    id: 'V004',
    name: 'SoundWave Co.',
    type: 'manufacturer',
    status: 'active',
    address: '5, Jalan Kenanga, Taman Melawati',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    website: 'www.soundwave.co',
    registeredAt: '2023-07-15',
    paymentTerms: 'Net 30',
    tags: ['Electronics', 'Audio', 'Top Performer'],
    notes: 'Consistently high fulfillment rate. Recommended for audio product lines.',
    contacts: [
      { name: 'Michelle Tan', role: 'Account Manager', email: 'michelle@soundwave.co', phone: '+60 16-555 4433' },
      { name: 'Brian Koh', role: 'Technical', email: 'brian@soundwave.co', phone: '+60 16-555 4444' },
    ],
    products: [
      { productId: 'P010', productName: 'Noise Cancelling Earbuds', sku: 'NCE-010', category: 'Electronics', currentStock: 88, lowStockThreshold: 15, unitCost: 52.50, status: 'in_stock' },
    ],
    metrics: {
      totalOrders: 22,
      fulfilledOrders: 22,
      rejectedOrders: 0,
      fulfillmentRate: 100.0,
      avgDeliveryDays: 2.8,
      totalPurchaseValue: 89400.00,
      lastOrderDate: '2026-05-14',
      onTimeDeliveryRate: 100.0,
    },
  },
  {
    id: 'V005',
    name: 'SmartLife Corp.',
    type: 'distributor',
    status: 'active',
    address: '33, Jalan USJ 10/1, UEP Subang Jaya',
    city: 'Subang Jaya',
    country: 'Malaysia',
    website: 'www.smartlife.io',
    registeredAt: '2024-09-01',
    paymentTerms: 'Net 15',
    tags: ['Smart Home', 'IoT', 'Electronics'],
    contacts: [
      { name: 'David Chen', role: 'CEO', email: 'david@smartlife.io', phone: '+60 12-999 0011' },
    ],
    products: [
      { productId: 'P012', productName: 'Smart Home Hub Device', sku: 'SHH-012', category: 'Smart Home', currentStock: 34, lowStockThreshold: 8, unitCost: 69.00, status: 'in_stock' },
    ],
    metrics: {
      totalOrders: 9,
      fulfilledOrders: 9,
      rejectedOrders: 0,
      fulfillmentRate: 100.0,
      avgDeliveryDays: 3.5,
      totalPurchaseValue: 41800.00,
      lastOrderDate: '2026-05-12',
      onTimeDeliveryRate: 88.9,
    },
  },
  {
    id: 'V006',
    name: 'GlobalGear Supply',
    type: 'distributor',
    status: 'inactive',
    address: '88, Jalan Ipoh, Batu 5',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    registeredAt: '2022-05-20',
    paymentTerms: 'Net 60',
    tags: ['Mixed', 'Bulk'],
    notes: 'Contract expired. Pending renewal discussions.',
    contacts: [
      { name: 'Tony Wee', role: 'Sales', email: 'tony@globalgear.com', phone: '+60 14-222 3344' },
    ],
    products: [],
    metrics: {
      totalOrders: 5,
      fulfilledOrders: 3,
      rejectedOrders: 2,
      fulfillmentRate: 60.0,
      avgDeliveryDays: 10.2,
      totalPurchaseValue: 9800.00,
      lastOrderDate: '2025-12-01',
      onTimeDeliveryRate: 60.0,
    },
  },
];