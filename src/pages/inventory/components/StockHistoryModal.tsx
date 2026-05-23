import { Product } from '@/mocks/inventory';
import { StockHistoryEntry } from '@/mocks/stockHistory';

interface StockHistoryModalProps {
  product: Product;
  history: StockHistoryEntry[];
  onClose: () => void;
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  sale: { label: 'Sale', icon: 'ri-shopping-bag-3-line', color: 'text-rose-600', bg: 'bg-rose-50' },
  purchase: { label: 'Purchase', icon: 'ri-add-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  transfer_in: { label: 'Transfer In', icon: 'ri-arrow-right-down-line', color: 'text-sky-600', bg: 'bg-sky-50' },
  transfer_out: { label: 'Transfer Out', icon: 'ri-arrow-right-up-line', color: 'text-violet-600', bg: 'bg-violet-50' },
  return: { label: 'Return', icon: 'ri-arrow-go-back-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  adjustment: { label: 'Adjustment', icon: 'ri-equalizer-line', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function StockHistoryModal({ product, history, onClose }: StockHistoryModalProps) {
  const productHistory = history.filter((h) => h.productId === product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl mx-4 shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Stock History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product.name} · {product.sku}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-0 border-b border-gray-100 shrink-0">
          {[
            { label: 'Current Stock', value: String(product.stock), icon: 'ri-stack-line', color: 'text-gray-800' },
            {
              label: 'Total In',
              value: `+${productHistory.filter(h => h.quantity > 0).reduce((s, h) => s + h.quantity, 0)}`,
              icon: 'ri-arrow-down-circle-line',
              color: 'text-emerald-600',
            },
            {
              label: 'Total Out',
              value: `${productHistory.filter(h => h.quantity < 0).reduce((s, h) => s + h.quantity, 0)}`,
              icon: 'ri-arrow-up-circle-line',
              color: 'text-rose-600',
            },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 border-r border-gray-100 last:border-r-0">
              <div className={`w-5 h-5 flex items-center justify-center mb-1`}>
                <i className={`${stat.icon} ${stat.color} text-base`}></i>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* History list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
          {productHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-10 h-10 flex items-center justify-center mb-3">
                <i className="ri-history-line text-3xl"></i>
              </div>
              <p className="text-sm">No history available for this product.</p>
            </div>
          ) : (
            productHistory.map((entry) => {
              const cfg = typeConfig[entry.type] ?? typeConfig.adjustment;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      <span className={`text-sm font-bold ${entry.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5 leading-tight">{entry.note}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">Ref: {entry.reference}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{entry.user}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400">{entry.stockBefore}</span>
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-arrow-right-line text-gray-300 text-xs"></i>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{entry.stockAfter} units</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}