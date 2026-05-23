import { useState } from 'react';

interface Action {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  desc: string;
}

const actions: Action[] = [
  { label: 'Add Product', icon: 'ri-add-box-line', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', desc: 'Add new product to inventory' },
  { label: 'Create Transfer', icon: 'ri-swap-box-line', iconBg: 'bg-sky-50', iconColor: 'text-sky-600', desc: 'Vendor → BM transfer request' },
  { label: 'New Purchase Order', icon: 'ri-shopping-cart-2-line', iconBg: 'bg-violet-50', iconColor: 'text-violet-600', desc: 'BM procurement order' },
  { label: 'Process Return', icon: 'ri-arrow-go-back-line', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', desc: 'Handle customer return' },
  { label: 'Create Promotion', icon: 'ri-price-tag-3-line', iconBg: 'bg-pink-50', iconColor: 'text-pink-500', desc: 'Set discount rules' },
  { label: 'Adjust Stock', icon: 'ri-equalizer-2-line', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', desc: 'Manual stock correction' },
];

export default function QuickActions() {
  const [clicked, setClicked] = useState<string | null>(null);

  const handleClick = (label: string) => {
    setClicked(label);
    setTimeout(() => setClicked(null), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
        <p className="text-xs text-gray-400 mt-0.5">Shortcuts for common tasks</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => handleClick(a.label)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg border transition-all cursor-pointer text-left ${
              clicked === a.label
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/70'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${a.icon} ${a.iconColor} text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}