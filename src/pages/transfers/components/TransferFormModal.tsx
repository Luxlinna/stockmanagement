import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NewTransferItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface FormData {
  id: string;
  fromWarehouse: 'BM Warehouse' | 'Vendor Warehouse';
  toWarehouse: 'BM Warehouse' | 'Vendor Warehouse';
  reason: string;
  notes: string;
  expectedArrival: string;
  items: NewTransferItem[];
}

interface TransferFormModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const emptyForm = (): FormData => ({
  id: '',
  fromWarehouse: 'Vendor Warehouse',
  toWarehouse: 'BM Warehouse',
  reason: '',
  notes: '',
  expectedArrival: '',
  items: [],
});

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  stock: number;
  warehouse: string;
}

export default function TransferFormModal({ onClose, onSubmit }: TransferFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  const autoTransferId = useMemo(
    () => `TRF-${String(Math.floor(Date.now() / 1000) % 100000).padStart(5, '0')}`,
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('id, name, sku, stock, warehouse');
      if (error) console.error(error);
      else setProducts((data || []).map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, warehouse: p.warehouse })));
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!form.id) {
      setForm((prev) => ({ ...prev, id: autoTransferId }));
    }
  }, [form.id, autoTransferId]);

  const availableProducts = products.filter(
    (p) => p.warehouse === form.fromWarehouse && p.stock > 0 && !form.items.find((i) => i.productId === p.id)
  );

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product || selectedQty < 1) return;
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { productId: product.id, productName: product.name, sku: product.sku, quantity: selectedQty, unitPrice: 0 },
      ],
    }));
    setSelectedProduct('');
    setSelectedQty(1);
  };

  const removeItem = (productId: string) => {
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.productId !== productId) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fromWarehouse === form.toWarehouse) e.warehouse = 'Source and destination must be different warehouses.';
    if (!form.reason.trim()) e.reason = 'Reason is required.';
    if (form.items.length === 0) e.items = 'Add at least one product.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Transfer Request</h2>
            <p className="text-sm text-gray-500 mt-0.5">Move stock between BM Warehouse and Vendor Warehouse</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Transfer ID</label>
            <input
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              placeholder="TRF-0001"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
            />
          </div>

          {/* Warehouse selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">From Warehouse</label>
              <select
                value={form.fromWarehouse}
                onChange={(e) => setForm((f) => ({ ...f, fromWarehouse: e.target.value as typeof f.fromWarehouse, items: [] }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 cursor-pointer"
              >
                <option value="BM Warehouse">BM Warehouse</option>
                <option value="Vendor Warehouse">Vendor Warehouse</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">To Warehouse</label>
              <select
                value={form.toWarehouse}
                onChange={(e) => setForm((f) => ({ ...f, toWarehouse: e.target.value as typeof f.toWarehouse }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 cursor-pointer"
              >
                <option value="BM Warehouse">BM Warehouse</option>
                <option value="Vendor Warehouse">Vendor Warehouse</option>
              </select>
            </div>
          </div>
          {errors.warehouse && <p className="text-xs text-red-500 -mt-3">{errors.warehouse}</p>}

          {/* Reason + Expected Arrival */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason *</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Restock low inventory"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
              />
              {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Expected Arrival</label>
              <input
                type="date"
                value={form.expectedArrival}
                onChange={(e) => setForm((f) => ({ ...f, expectedArrival: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              maxLength={500}
              placeholder="Optional — any special instructions or remarks"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Add Items */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Products to Transfer *</label>
            {loading ? (
              <div className="text-xs text-gray-400 py-2">Loading products...</div>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 cursor-pointer"
                  >
                    <option value="">Select product from {form.fromWarehouse}…</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.stock} in stock</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={addItem}
                    disabled={!selectedProduct}
                    className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-1"></i>Add
                  </button>
                </div>
              </>
            )}

            {form.items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{item.productName}</td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-2.5 text-center text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button onClick={() => removeItem(item.productId)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-auto">
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-lg py-6 text-center text-sm text-gray-400">
                No products added yet
              </div>
            )}
            {errors.items && <p className="text-xs text-red-500 mt-1">{errors.items}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-send-plane-line mr-1.5"></i>Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}