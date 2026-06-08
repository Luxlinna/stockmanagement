-- ============================================================
-- Seed Data
-- ============================================================

-- Default admin user (password: admin123)
-- Default admin: email=admin@stock.io  password=admin123
INSERT INTO users (id, email, password_hash) VALUES
  ('USR-001', 'admin@stock.io',
   '$2a$10$sWnVxw74dT1pJiyZ1UWPsukC3Cqfdrl.u11TddkwX8feDnQCiFHYu')
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role) VALUES
  ('USR-001', 'admin@stock.io', 'Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_settings (user_id, email_enabled, sms_enabled, in_app_enabled, browser_push_enabled, category_thresholds) VALUES
  ('USR-001', true, false, true, true,
   '{"Electronics":5,"Furniture":3,"Lighting":4,"Smart Home":5,"Accessories":10}')
ON CONFLICT (user_id) DO NOTHING;

-- PRODUCTS
INSERT INTO products (id, name, sku, category, warehouse, vendor, stock, low_stock_threshold, price, status, last_updated) VALUES
  ('P001','Wireless Bluetooth Headphones','WBH-001','Electronics','BM Warehouse',NULL,124,20,89.99,'in_stock','2026-05-19 09:15'),
  ('P002','Ergonomic Office Chair','EOC-002','Furniture','BM Warehouse',NULL,8,15,349.00,'low_stock','2026-05-19 08:30'),
  ('P003','USB-C Charging Cable 2m','UCC-003','Accessories','Vendor Warehouse','TechSupply Co.',0,50,12.99,'out_of_stock','2026-05-18 22:00'),
  ('P004','Mechanical Keyboard RGB','MKR-004','Electronics','BM Warehouse',NULL,45,10,129.99,'in_stock','2026-05-19 10:00'),
  ('P005','Standing Desk Converter','SDC-005','Furniture','Vendor Warehouse','ErgoWorks Ltd.',3,10,199.50,'low_stock','2026-05-19 07:45'),
  ('P006','LED Monitor 27 inch','LMN-006','Electronics','BM Warehouse',NULL,67,15,279.00,'in_stock','2026-05-19 11:20'),
  ('P007','Laptop Cooling Pad','LCP-007','Accessories','Vendor Warehouse','CoolTech Inc.',5,20,34.99,'low_stock','2026-05-19 06:00'),
  ('P008','Webcam 4K Ultra HD','WCM-008','Electronics','BM Warehouse',NULL,22,10,159.99,'in_stock','2026-05-19 09:50'),
  ('P009','Desk Lamp LED Dimmable','DLD-009','Lighting','BM Warehouse',NULL,0,25,49.99,'out_of_stock','2026-05-18 18:00'),
  ('P010','Noise Cancelling Earbuds','NCE-010','Electronics','Vendor Warehouse','SoundWave Co.',88,15,74.99,'in_stock','2026-05-19 10:30'),
  ('P011','Portable Power Bank 20000mAh','PPB-011','Accessories','BM Warehouse',NULL,12,20,59.99,'low_stock','2026-05-19 08:00'),
  ('P012','Smart Home Hub Device','SHH-012','Smart Home','Vendor Warehouse','SmartLife Corp.',34,8,99.00,'in_stock','2026-05-19 11:00')
ON CONFLICT (id) DO NOTHING;

-- STOCK HISTORY
INSERT INTO stock_history (id, product_id, type, quantity, stock_before, stock_after, reference, note, warehouse, user_name, created_at) VALUES
  ('SH-001','P001','sale',-5,129,124,'ORD-2841','Order #ORD-2841 dispatched','BM Warehouse','Admin','2026-05-19 11:30'),
  ('SH-002','P001','purchase',50,79,129,'PO-0188','Purchase order received','BM Warehouse','Admin','2026-05-17 09:00'),
  ('SH-003','P001','return',2,77,79,'RET-0031','Customer return replaced','BM Warehouse','Admin','2026-05-16 14:20'),
  ('SH-004','P001','adjustment',-3,80,77,'ADJ-0019','Stock count correction','BM Warehouse','Admin','2026-05-15 10:00'),
  ('SH-005','P002','sale',-2,10,8,'ORD-2835','Order #ORD-2835 fulfilled','BM Warehouse','Admin','2026-05-19 08:30'),
  ('SH-006','P002','purchase',5,5,10,'PO-0183','Partial purchase received','BM Warehouse','Admin','2026-05-18 11:00'),
  ('SH-007','P003','sale',-10,10,0,'ORD-2830','Order fulfilled — out of stock','Vendor Warehouse','TechSupply Co.','2026-05-18 22:00'),
  ('SH-008','P004','sale',-3,48,45,'ORD-2840','Order #ORD-2840 fulfilled','BM Warehouse','Admin','2026-05-19 08:20'),
  ('SH-009','P004','transfer_in',20,28,48,'TRF-0040','Transfer from Vendor Warehouse','BM Warehouse','Admin','2026-05-18 15:00'),
  ('SH-010','P005','adjustment',-7,10,3,'ADJ-0020','Stock sold outside platform','Vendor Warehouse','ErgoWorks Ltd.','2026-05-19 08:50'),
  ('SH-011','P006','purchase',20,47,67,'PO-0192','PO-0192 received','BM Warehouse','Admin','2026-05-19 10:15'),
  ('SH-012','P007','sale',-15,20,5,'ORD-2828','Bulk order fulfilled','Vendor Warehouse','CoolTech Inc.','2026-05-18 16:00'),
  ('SH-013','P010','transfer_in',30,58,88,'TRF-0044','Transfer to BM Warehouse','Vendor Warehouse','SoundWave Co.','2026-05-19 09:45')
ON CONFLICT (id) DO NOTHING;

-- WAREHOUSES
INSERT INTO warehouses (id, name, type, address, city, country, manager, manager_email, manager_phone, operating_hours, total_capacity, used_capacity, total_skus, total_units, inbound_today, outbound_today, pending_pickups, last_audit, notes, zones, staff, monthly_activity) VALUES
  ('WH001','BM Warehouse','owned','12, Jalan Industri 4, Bukit Mertajam Industrial Park','Bukit Mertajam, Penang','Malaysia','Hafiz Roslan','hafiz@stockmanagement.io','+60 12-600 7788','Mon–Sat, 8:00 AM – 8:00 PM',5000,3410,7,1178,42,78,5,'2026-05-01','Primary fulfillment hub.',
   '[{"id":"Z001","name":"Zone A — Electronics","type":"storage","capacity":1500,"used":1120,"skuCount":4},{"id":"Z002","name":"Zone B — Furniture","type":"storage","capacity":1200,"used":950,"skuCount":2},{"id":"Z003","name":"Zone C — Accessories","type":"storage","capacity":800,"used":620,"skuCount":1},{"id":"Z004","name":"Receiving Dock","type":"receiving","capacity":500,"used":300,"skuCount":0},{"id":"Z005","name":"Dispatch Bay","type":"shipping","capacity":600,"used":280,"skuCount":0},{"id":"Z006","name":"Returns Area","type":"returns","capacity":400,"used":140,"skuCount":0}]',
   '[{"name":"Hafiz Roslan","role":"Warehouse Manager","shift":"morning"},{"name":"Siti Aminah","role":"Inventory Clerk","shift":"morning"},{"name":"Rajan Kumar","role":"Forklift Operator","shift":"morning"},{"name":"Chen Wei","role":"Packing Staff","shift":"evening"},{"name":"Farah Aziz","role":"Receiving Officer","shift":"morning"}]',
   '[{"month":"Jan","inbound":380,"outbound":420,"returns":18},{"month":"Feb","inbound":310,"outbound":390,"returns":12},{"month":"Mar","inbound":450,"outbound":510,"returns":22},{"month":"Apr","inbound":500,"outbound":580,"returns":25},{"month":"May","inbound":420,"outbound":490,"returns":20}]'),
  ('WH002','Vendor Warehouse','vendor','Unit 5, Jalan Teknologi 7, Taman Industri Selama','Subang Jaya, Selangor','Malaysia','Michelle Tan','michelle@soundwave.co','+60 16-555 4433','Mon–Fri, 9:00 AM – 6:00 PM',3000,1548,5,1131,30,55,3,'2026-04-20','Multi-vendor operated space.',
   '[{"id":"Z007","name":"Section 1 — SoundWave Co.","type":"storage","capacity":800,"used":620,"skuCount":1},{"id":"Z008","name":"Section 2 — ErgoWorks Ltd.","type":"storage","capacity":700,"used":210,"skuCount":2},{"id":"Z009","name":"Section 3 — CoolTech Inc.","type":"storage","capacity":400,"used":88,"skuCount":1},{"id":"Z010","name":"Section 4 — SmartLife Corp.","type":"storage","capacity":500,"used":340,"skuCount":1},{"id":"Z011","name":"Staging Area","type":"staging","capacity":300,"used":150,"skuCount":0},{"id":"Z012","name":"Inbound Dock","type":"receiving","capacity":300,"used":140,"skuCount":0}]',
   '[{"name":"Michelle Tan","role":"Site Coordinator","shift":"morning"},{"name":"Raj Patel","role":"Vendor Liaison","shift":"morning"},{"name":"Amy Lee","role":"Inventory Tracker","shift":"morning"},{"name":"Brian Koh","role":"Packing Specialist","shift":"evening"}]',
   '[{"month":"Jan","inbound":210,"outbound":280,"returns":10},{"month":"Feb","inbound":180,"outbound":240,"returns":8},{"month":"Mar","inbound":250,"outbound":310,"returns":14},{"month":"Apr","inbound":300,"outbound":350,"returns":16},{"month":"May","inbound":270,"outbound":320,"returns":11}]')
ON CONFLICT (id) DO NOTHING;

-- VENDORS
INSERT INTO vendors (id, name, type, status, address, city, country, website, registered_at, payment_terms, tags, notes, contacts, products, metrics) VALUES
  ('V001','TechSupply Co.','distributor','active','18, Jalan Teknologi, Taman Sains Selangor','Shah Alam','Malaysia','www.techsupply.co','2024-03-15','Net 30',ARRAY['Electronics','Accessories','Priority'],'Primary accessories distributor.',
   '[{"name":"Kevin Lam","role":"Account Manager","email":"kevin@techsupply.co","phone":"+60 12-888 9900"}]',
   '[{"productId":"P003","productName":"USB-C Charging Cable 2m","sku":"UCC-003","category":"Accessories","currentStock":0,"lowStockThreshold":50,"unitCost":12.99,"status":"out_of_stock"}]',
   '{"totalOrders":28,"fulfilledOrders":24,"rejectedOrders":2,"fulfillmentRate":85.7,"avgDeliveryDays":3.2,"totalPurchaseValue":38450.00,"lastOrderDate":"2026-05-19","onTimeDeliveryRate":91.7}'),
  ('V002','ErgoWorks Ltd.','manufacturer','active','7, Persiaran Industri, Bandar Sri Damansara','Kuala Lumpur','Malaysia','www.ergoworks.com','2023-11-20','Net 45',ARRAY['Furniture','Ergonomics'],'Handles large furniture orders.',
   '[{"name":"Sandra Ng","role":"Sales Director","email":"sandra@ergoworks.com","phone":"+60 13-444 5566"}]',
   '[{"productId":"P002","productName":"Ergonomic Office Chair","sku":"EOC-002","category":"Furniture","currentStock":8,"lowStockThreshold":15,"unitCost":280.00,"status":"low_stock"},{"productId":"P005","productName":"Standing Desk Converter","sku":"SDC-005","category":"Furniture","currentStock":3,"lowStockThreshold":10,"unitCost":168.75,"status":"low_stock"}]',
   '{"totalOrders":15,"fulfilledOrders":13,"rejectedOrders":1,"fulfillmentRate":86.7,"avgDeliveryDays":6.8,"totalPurchaseValue":67300.00,"lastOrderDate":"2026-05-18","onTimeDeliveryRate":80.0}'),
  ('V003','CoolTech Inc.','supplier','active','22, Jalan PJU 1A/46, Ara Damansara','Petaling Jaya','Malaysia','www.cooltech.io','2025-01-08','Net 30',ARRAY['Accessories','Cooling'],NULL,
   '[{"name":"Raj Patel","role":"Operations Manager","email":"raj@cooltech.io","phone":"+60 17-321 0011"}]',
   '[{"productId":"P007","productName":"Laptop Cooling Pad","sku":"LCP-007","category":"Accessories","currentStock":5,"lowStockThreshold":20,"unitCost":17.50,"status":"low_stock"}]',
   '{"totalOrders":12,"fulfilledOrders":11,"rejectedOrders":0,"fulfillmentRate":91.7,"avgDeliveryDays":4.1,"totalPurchaseValue":15200.00,"lastOrderDate":"2026-05-17","onTimeDeliveryRate":100.0}'),
  ('V004','SoundWave Co.','manufacturer','active','5, Jalan Kenanga, Taman Melawati','Kuala Lumpur','Malaysia','www.soundwave.co','2023-07-15','Net 30',ARRAY['Electronics','Audio','Top Performer'],'Consistently high fulfillment rate.',
   '[{"name":"Michelle Tan","role":"Account Manager","email":"michelle@soundwave.co","phone":"+60 16-555 4433"}]',
   '[{"productId":"P010","productName":"Noise Cancelling Earbuds","sku":"NCE-010","category":"Electronics","currentStock":88,"lowStockThreshold":15,"unitCost":52.50,"status":"in_stock"}]',
   '{"totalOrders":22,"fulfilledOrders":22,"rejectedOrders":0,"fulfillmentRate":100.0,"avgDeliveryDays":2.8,"totalPurchaseValue":89400.00,"lastOrderDate":"2026-05-14","onTimeDeliveryRate":100.0}'),
  ('V005','SmartLife Corp.','distributor','active','33, Jalan USJ 10/1, UEP Subang Jaya','Subang Jaya','Malaysia','www.smartlife.io','2024-09-01','Net 15',ARRAY['Smart Home','IoT'],NULL,
   '[{"name":"David Chen","role":"CEO","email":"david@smartlife.io","phone":"+60 12-999 0011"}]',
   '[{"productId":"P012","productName":"Smart Home Hub Device","sku":"SHH-012","category":"Smart Home","currentStock":34,"lowStockThreshold":8,"unitCost":69.00,"status":"in_stock"}]',
   '{"totalOrders":9,"fulfilledOrders":9,"rejectedOrders":0,"fulfillmentRate":100.0,"avgDeliveryDays":3.5,"totalPurchaseValue":41800.00,"lastOrderDate":"2026-05-12","onTimeDeliveryRate":88.9}'),
  ('V006','GlobalGear Supply','distributor','inactive','88, Jalan Ipoh, Batu 5','Kuala Lumpur','Malaysia',NULL,'2022-05-20','Net 60',ARRAY['Mixed','Bulk'],'Contract expired.',
   '[{"name":"Tony Wee","role":"Sales","email":"tony@globalgear.com","phone":"+60 14-222 3344"}]','[]',
   '{"totalOrders":5,"fulfilledOrders":3,"rejectedOrders":2,"fulfillmentRate":60.0,"avgDeliveryDays":10.2,"totalPurchaseValue":9800.00,"lastOrderDate":"2025-12-01","onTimeDeliveryRate":60.0}')
ON CONFLICT (id) DO NOTHING;

-- PURCHASES
INSERT INTO purchases (id, vendor, vendor_contact, vendor_email, warehouse, status, items, total_items, subtotal, tax, total, requested_by, notes, expected_delivery, created_at, updated_at) VALUES
  ('PO-0198','TechSupply Co.','Kevin Lam','kevin@techsupply.co','BM Warehouse','submitted',
   '[{"productId":"P003","productName":"USB-C Charging Cable 2m","sku":"UCC-003","orderedQty":200,"receivedQty":0,"unitCost":12.99}]',
   200,2598.00,155.88,2753.88,'Admin','Priority — out of stock item.','2026-05-23','2026-05-19 10:00','2026-05-19 10:00'),
  ('PO-0197','ErgoWorks Ltd.','Sandra Ng','sandra@ergoworks.com','BM Warehouse','approved',
   '[{"productId":"P002","productName":"Ergonomic Office Chair","sku":"EOC-002","orderedQty":20,"receivedQty":0,"unitCost":280.00},{"productId":"P005","productName":"Standing Desk Converter","sku":"SDC-005","orderedQty":10,"receivedQty":0,"unitCost":168.75}]',
   30,10485.00,629.10,11114.10,'Admin','Bulk restock for Q2.','2026-05-25','2026-05-18 09:00','2026-05-18 14:00'),
  ('PO-0196','CoolTech Inc.','Raj Patel','raj@cooltech.io','Vendor Warehouse','ordered',
   '[{"productId":"P007","productName":"Laptop Cooling Pad","sku":"LCP-007","orderedQty":50,"receivedQty":0,"unitCost":17.50}]',
   50,875.00,52.50,927.50,'Admin',NULL,'2026-05-22','2026-05-17 11:00','2026-05-17 15:30'),
  ('PO-0195','SoundWave Co.','Michelle Tan','michelle@soundwave.co','Vendor Warehouse','received',
   '[{"productId":"P010","productName":"Noise Cancelling Earbuds","sku":"NCE-010","orderedQty":60,"receivedQty":60,"unitCost":52.50}]',
   60,3150.00,189.00,3339.00,'Admin',NULL,'2026-05-15','2026-05-13 09:00','2026-05-15 14:00')
ON CONFLICT (id) DO NOTHING;

-- ORDERS
INSERT INTO orders (id, customer, email, phone, address, city, status, total, item_count, vendor_splits, created_at, updated_at) VALUES
  ('ORD-2845','Zara Mitchell','zara.mitchell@email.com','+60 12-345 6789','45, Jalan Ampang','Kuala Lumpur, MY','pending',179.98,2,'[]','2026-05-19 13:00','2026-05-19 13:00'),
  ('ORD-2844','Ahmed Al-Rashid','ahmed@email.com','+60 11-222 3344','12, Jalan Klang Lama','Shah Alam, MY','processing',329.99,2,'[]','2026-05-19 12:00','2026-05-19 12:30'),
  ('ORD-2841','Zara Mitchell','zara.mitchell@email.com','+60 12-345 6789','45, Jalan Ampang','Kuala Lumpur, MY','fulfilled',449.95,5,'[]','2026-05-19 08:00','2026-05-19 11:30')
ON CONFLICT (id) DO NOTHING;

-- DELIVERIES
INSERT INTO deliveries (id, order_id, customer, items, status, last_update, destination) VALUES
  ('D001','ORD-2841','Zara Mitchell',3,'in_transit','2026-05-19 11:00','Kuala Lumpur, MY'),
  ('D002','ORD-2839','Ahmed Al-Rashid',1,'ready','2026-05-19 09:30','Shah Alam, MY'),
  ('D003','ORD-2838','Priya Nair',5,'delivered','2026-05-19 08:45','Petaling Jaya, MY'),
  ('D004','ORD-2843','Jason Tan',2,'prepare','2026-05-19 11:20','Subang Jaya, MY'),
  ('D005','ORD-2842','Nurul Huda',4,'in_transit','2026-05-19 10:40','Cheras, MY')
ON CONFLICT (id) DO NOTHING;

-- TRANSFERS
INSERT INTO transfers (id, from_warehouse, to_warehouse, requested_by, approved_by, status, items, total_items, reason, notes, expected_arrival, created_at, updated_at) VALUES
  ('TRF-0051','Vendor Warehouse','BM Warehouse','Admin','Admin','in_transit',
   '[{"productId":"P010","productName":"Noise Cancelling Earbuds","sku":"NCE-010","quantity":30,"unitPrice":74.99}]',
   30,'Restock low inventory','Urgent — earbuds running low at BM.','2026-05-20','2026-05-19 08:00','2026-05-19 09:30'),
  ('TRF-0050','BM Warehouse','Vendor Warehouse','SoundWave Co.','Admin','received',
   '[{"productId":"P001","productName":"Wireless Bluetooth Headphones","sku":"WBH-001","quantity":20,"unitPrice":89.99}]',
   20,'Vendor stock rotation',NULL,'2026-05-18','2026-05-17 10:00','2026-05-18 14:00')
ON CONFLICT (id) DO NOTHING;

-- RETURNS
INSERT INTO returns (id, order_id, customer, email, phone, status, items, total_items, total_value, reason, reason_note, refund_method, refund_amount, warehouse, created_at, updated_at) VALUES
  ('RET-0021','ORD-2835','Zara Mitchell','zara.mitchell@email.com','+60 12-345 6789','pending',
   '[{"productId":"P001","productName":"Wireless Bluetooth Headphones","sku":"WBH-001","quantity":1,"unitPrice":89.99}]',
   1,89.99,'defective','Left earcup stopped working.','original_payment',89.99,'BM Warehouse','2026-05-19 09:00','2026-05-19 09:00'),
  ('RET-0020','ORD-2828','Priya Nair','priya@email.com','+60 14-555 6677','approved',
   '[{"productId":"P002","productName":"Ergonomic Office Chair","sku":"EOC-002","quantity":1,"unitPrice":349.00}]',
   1,349.00,'not_as_described','Chair dimensions smaller than advertised.','store_credit',349.00,'BM Warehouse','2026-05-18 10:00','2026-05-19 08:30')
ON CONFLICT (id) DO NOTHING;

-- PROMOTIONS
INSERT INTO promotions (id, name, type, status, description, discount_value, min_order_amount, max_usage_count, usage_count, products, start_date, end_date, total_revenue, total_units_sold, created_at, updated_at) VALUES
  ('PROMO-001','Tech Sale — 20% Off Electronics','percentage','active','Enjoy 20% off all electronics!',20,50,500,238,
   '[{"productId":"P001","productName":"Wireless Bluetooth Headphones","sku":"WBH-001","originalPrice":89.99,"currentStock":124,"expectedSalesPerDay":12}]',
   '2026-05-15','2026-05-25',18420.00,312,'2026-05-14 09:00','2026-05-19 08:00'),
  ('PROMO-002','Furniture Clearance — RM50 Off','fixed_amount','active','RM50 off any furniture purchase over RM200.',50,200,NULL,45,
   '[{"productId":"P002","productName":"Ergonomic Office Chair","sku":"EOC-002","originalPrice":349.00,"currentStock":8,"expectedSalesPerDay":3}]',
   '2026-05-10','2026-05-31',13275.00,45,'2026-05-09 10:00','2026-05-19 07:00')
ON CONFLICT (id) DO NOTHING;

-- ACTIVITY LOG
INSERT INTO activity_log (type, description, product, quantity, warehouse, user_name, created_at) VALUES
  ('sale','Order #ORD-2841 dispatched','Wireless Bluetooth Headphones',5,'BM Warehouse','Admin','2026-05-19 11:30'),
  ('purchase','Purchase Order #PO-0192 received','LED Monitor 27 inch',20,'BM Warehouse','Admin','2026-05-19 10:15'),
  ('transfer','Transfer #TRF-0044 completed','Noise Cancelling Earbuds',30,'Vendor → BM','SoundWave Co.','2026-05-19 09:45'),
  ('return','Customer return processed','Ergonomic Office Chair',1,'BM Warehouse','Admin','2026-05-19 09:10'),
  ('adjustment','Stock adjustment: sold outside platform','Standing Desk Converter',-7,'Vendor Warehouse','ErgoWorks Ltd.','2026-05-19 08:50'),
  ('sale','Order #ORD-2840 fulfilled','Mechanical Keyboard RGB',3,'BM Warehouse','Admin','2026-05-19 08:20'),
  ('purchase','Purchase Order #PO-0191 confirmed','USB-C Charging Cable 2m',100,'BM Warehouse','Admin','2026-05-19 07:30');

-- DAILY REVENUE
INSERT INTO daily_revenue (date, revenue, orders, returns) VALUES
  ('May 1',3240,14,1),('May 2',4120,18,2),('May 3',2980,12,0),('May 4',5640,24,3),
  ('May 5',6210,27,2),('May 6',4880,21,1),('May 7',3560,15,2),('May 8',5120,22,1),
  ('May 9',4790,20,3),('May 10',6840,29,2),('May 11',7230,31,4),('May 12',5980,25,2),
  ('May 13',4540,19,1),('May 14',6780,29,3),('May 15',8120,35,4),('May 16',7640,33,2),
  ('May 17',6900,30,3),('May 18',8450,36,5),('May 19',9120,39,4)
ON CONFLICT (date) DO NOTHING;

-- MONTHLY SNAPSHOTS
INSERT INTO monthly_snapshots (month, revenue, orders, returns, transfers, purchases, avg_order_value) VALUES
  ('2026-01',128400,542,38,24,18,236.90),('2026-02',114200,481,29,19,14,237.42),
  ('2026-03',156700,661,52,31,22,237.07),('2026-04',172300,727,61,38,27,236.93),
  ('2026-05',143600,597,47,29,21,240.54)
ON CONFLICT (month) DO NOTHING;

-- TOP PRODUCTS
INSERT INTO top_products (product_id, product_name, sku, category, units_sold, revenue, return_rate, trend) VALUES
  ('P001','Wireless Bluetooth Headphones','WBH-001','Electronics',312,28076.88,2.1,'up'),
  ('P006','LED Monitor 27 inch','LMN-006','Electronics',248,69192.00,1.2,'stable'),
  ('P004','Mechanical Keyboard RGB','MKR-004','Electronics',201,26127.99,0.8,'up'),
  ('P010','Noise Cancelling Earbuds','NCE-010','Electronics',189,14174.11,1.5,'stable'),
  ('P002','Ergonomic Office Chair','EOC-002','Furniture',87,30363.00,3.4,'down'),
  ('P012','Smart Home Hub Device','SHH-012','Smart Home',76,7524.00,1.1,'up');

-- CATEGORY BREAKDOWN
INSERT INTO category_breakdown (category, revenue, units_sold, return_rate, color) VALUES
  ('Electronics',138470.00,1050,1.4,'#10b981'),('Furniture',41638.50,132,3.1,'#3b82f6'),
  ('Accessories',18240.60,642,2.2,'#f59e0b'),('Smart Home',9024.00,91,1.1,'#8b5cf6'),
  ('Lighting',5499.00,110,0.9,'#ec4899')
ON CONFLICT (category) DO NOTHING;

-- RETURN REASONS
INSERT INTO return_reasons (reason, count, value, percentage) VALUES
  ('Defective',28,4218.50,38.4),('Not as Described',17,2960.30,23.3),
  ('Wrong Item',12,1544.20,16.4),('Changed Mind',9,890.10,12.3),
  ('Damaged in Transit',7,1124.80,9.6)
ON CONFLICT (reason) DO NOTHING;

-- VENDOR PERFORMANCE
INSERT INTO vendor_performance (vendor, fulfillment_rate, total_orders, rejected_orders, avg_delivery_days, revenue) VALUES
  ('SoundWave Co.',100.0,22,0,2.8,89400.00),('SmartLife Corp.',100.0,9,0,3.5,41800.00),
  ('CoolTech Inc.',91.7,12,0,4.1,15200.00),('TechSupply Co.',85.7,28,2,3.2,38450.00),
  ('ErgoWorks Ltd.',86.7,15,1,6.8,67300.00),('GlobalGear Supply',60.0,5,2,10.2,9800.00)
ON CONFLICT (vendor) DO NOTHING;

-- WAREHOUSE PERFORMANCE
INSERT INTO warehouse_performance (warehouse, inbound, outbound, returns, fulfillment_rate, avg_processing_days) VALUES
  ('BM Warehouse',2060,2390,97,94.2,1.4),('Vendor Warehouse',1210,1500,59,88.6,2.1)
ON CONFLICT (warehouse) DO NOTHING;

-- ALERT RULES
INSERT INTO alert_rules (name, description, trigger_type, trigger_condition, notification_type, message_template, is_active) VALUES
  ('Low Stock Alert','Triggers when product stock falls below threshold','stock_below_threshold',
   '{"threshold":5}','low_stock','Low stock: {{product_name}} has only {{stock}} units left.',true),
  ('Out of Stock Alert','Triggers when stock reaches zero','stock_below_threshold',
   '{"threshold":0}','out_of_stock','{{product_name}} is now out of stock.',true);

-- NOTIFICATION ANALYTICS
INSERT INTO notification_analytics (day, type, total, read_count, emailed_count, sms_count, webhook_count) VALUES
  ('2026-05-15','low_stock',5,4,3,0,2),('2026-05-15','out_of_stock',2,2,2,0,1),
  ('2026-05-16','new_order',12,10,8,0,4),('2026-05-17','return_pending',3,2,1,0,0),
  ('2026-05-17','low_stock',6,5,4,0,2),('2026-05-18','new_order',15,13,10,0,5),
  ('2026-05-19','low_stock',7,4,3,0,2),('2026-05-19','new_order',11,8,6,0,3)
ON CONFLICT (day, type) DO NOTHING;
