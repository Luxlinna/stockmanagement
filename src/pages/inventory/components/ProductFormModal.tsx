import { useState, useEffect } from 'react';
import { Product } from '@/mocks/inventory';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'status' | 'lastUpdated'> & { id?: string }) => void;
}

const categories = ['Electronics', 'Furniture', 'Accessories', 'Lighting', 'Smart Home'];
const warehouses: ('BM Warehouse' | 'Vendor Warehouse')[] = ['BM Warehouse', 'Vendor Warehouse'];

export default function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    warehouse: 'BM Warehouse' as 'BM Warehouse' | 'Vendor Warehouse',
    vendor: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        warehouse: product.warehouse,
        vendor: product.vendor ?? '',
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        price: product.price,
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'stock' || name === 'lowStockThreshold' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: product?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product ? `Editing: ${product.name}` : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Wireless Keyboard"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                placeholder="e.g. WKB-015"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Warehouse</label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
              >
                {warehouses.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Vendor (optional)</label>
              <input
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                placeholder="e.g. TechSupply Co."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Initial Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Low Stock Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                min={1}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Price (RM)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}