import { useState, useEffect } from 'react';
import { Product } from '@/mocks/inventory';
import { supabase } from '@/lib/supabase';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'status' | 'lastUpdated'> & { id?: string }) => void;
}

const CATEGORY_STORAGE_KEY = 'inventory_categories';
const DEFAULT_CATEGORIES = ['Electronics', 'Furniture', 'Accessories', 'Lighting', 'Smart Home'];
const warehouses: ('BM Warehouse' | 'Vendor Warehouse')[] = ['BM Warehouse', 'Vendor Warehouse'];
const productTypes = ['kg', 'pack', 'box', 'piece', 'liter', 'meter', 'bottle', 'bundle'] as const;

export default function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [imageMode, setImageMode] = useState<'file' | 'url'>('url');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  type ProductFormState = {
  name: string;
  sku: string;
  category: string;
  warehouse: 'BM Warehouse' | 'Vendor Warehouse';
  vendor: string;
  imageUrl: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  productType: (typeof productTypes)[number];
};

  const [form, setForm] = useState<ProductFormState>({
    name: '',
    sku: '',
    category: 'Electronics',
    warehouse: 'BM Warehouse' as 'BM Warehouse' | 'Vendor Warehouse',
    vendor: '',
    imageUrl: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
    productType: 'pack',
  });

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase.from('categories').select('name').order('name', { ascending: true });
      if (!error && data) {
        setCategories(data.map((item) => item.name));
      } else if (localStorage.getItem(CATEGORY_STORAGE_KEY)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || '[]') as string[];
          if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
        } catch {
          localStorage.removeItem(CATEGORY_STORAGE_KEY);
        }
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        warehouse: product.warehouse,
        vendor: product.vendor ?? '',
        imageUrl: product.imageUrl ?? '',
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        price: product.price,
        productType: product.productType,
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'stock' || name === 'lowStockThreshold' || name === 'price'
          ? parseFloat(value) || 0
          : name === 'productType'
          ? (value as (typeof productTypes)[number])
          : value,
    }));
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Image</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-3 py-1.5 text-xs rounded-full border ${imageMode === 'file' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  Choose File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1.5 text-xs rounded-full border ${imageMode === 'url' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  Use URL
                </button>
              </div>
              {imageMode === 'file' ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFilePick}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              ) : (
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                />
              )}
              {form.imageUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <img src={form.imageUrl} alt="Preview" className="w-10 h-10 rounded-md object-cover border border-gray-100" />
                  <span>Preview</span>
                </div>
              )}
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Type</label>
              <select
                name="productType"
                value={form.productType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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