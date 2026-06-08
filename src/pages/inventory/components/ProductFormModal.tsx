import { useState, useEffect } from 'react';
import { Product } from '@/mocks/inventory';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ProductFormModalProps {
  product: Product | null;
  nextNum: number;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'status' | 'lastUpdated'> & { id?: string }) => void;
}

const categories = ['Electronics', 'Furniture', 'Accessories', 'Lighting', 'Smart Home'];
const warehouses: ('BM Warehouse' | 'Vendor Warehouse')[] = ['BM Warehouse', 'Vendor Warehouse'];

const SKIP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'for', 'and', 'or', 'with', 'at', 'by',
  'from', 'to', 'as', 'is', 'was', 'are', 'it', 'its',
]);

function autoSku(name: string, num: number): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 1 && !SKIP_WORDS.has(w.toLowerCase()));

  const letters = words
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('');

  if (!letters) return '';
  return `${letters.padEnd(3, 'X')}-${String(num).padStart(3, '0')}`;
}

export default function ProductFormModal({ product, nextNum, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    warehouse: 'BM Warehouse' as 'BM Warehouse' | 'Vendor Warehouse',
    vendor: '',
    description: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
  });
  const { formatAmount } = useCurrency();
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        warehouse: product.warehouse,
        vendor: product.vendor ?? '',
        description: product.description ?? '',
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        price: product.price,
      });
      setSkuManuallyEdited(true);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'sku') {
      setSkuManuallyEdited(true);
      setForm(prev => ({ ...prev, sku: value }));
      return;
    }

    setForm(prev => {
      const updated = {
        ...prev,
        [name]: name === 'stock' || name === 'lowStockThreshold' || name === 'price'
          ? parseFloat(value) || 0
          : value,
      };
      // Auto-generate SKU when name changes (unless user manually edited SKU)
      if (name === 'name' && !skuManuallyEdited) {
        updated.sku = autoSku(value, nextNum);
      }
      return updated;
    });
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkuManuallyEdited(true);
    setForm(prev => ({ ...prev, sku: e.target.value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      name: value,
      sku: skuManuallyEdited ? prev.sku : autoSku(value, nextNum),
    }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ ...form, id: product?.id });
  };

  const totalValue = form.price * form.stock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90dvh]">

        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product ? `Editing: ${product.name}` : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-2 gap-4">

              {/* Product Name — drives SKU auto-gen */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                />
              </div>

              {/* SKU — auto-filled, manually editable */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  SKU
                  {!skuManuallyEdited && form.sku && (
                    <span className="ml-2 text-emerald-600 font-normal">
                      <i className="ri-magic-line text-xs mr-0.5"></i>Auto-generated
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleSkuChange}
                    required
                    placeholder="e.g. WBH-001 (auto-fills from name)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 pr-20"
                  />
                  {skuManuallyEdited && !product && (
                    <button
                      type="button"
                      onClick={() => { setSkuManuallyEdited(false); setForm(p => ({ ...p, sku: autoSku(p.name, nextNum) })); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer px-1.5 py-0.5 bg-emerald-50 rounded font-medium whitespace-nowrap"
                    >
                      <i className="ri-refresh-line text-xs mr-0.5"></i>Reset
                    </button>
                  )}
                </div>
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

              <div className="col-span-2">
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

              {/* Price per unit */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Price per Unit (USD)</label>
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

              {/* Total value (read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Stock Value</label>
                <div className="w-full px-3 py-2 text-sm border border-gray-100 bg-gray-50 rounded-lg text-gray-700 font-semibold">
                  {formatAmount(totalValue)}
                  <span className="text-xs font-normal text-gray-400 ml-1.5">
                    {form.stock} × {formatAmount(form.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description (optional)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Short description of the product, features, specifications..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 resize-none"
                />
              </div>

            </div>
          </div>

          {/* Sticky footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
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
