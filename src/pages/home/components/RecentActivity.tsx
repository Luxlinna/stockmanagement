import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  type: string;
  description: string;
  product: string;
  quantity: number;
  warehouse: string;
  user_name: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: string; iconBg: string; iconColor: string; label: string }> = {
  sale: { icon: 'ri-shopping-bag-3-line', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Sale' },
  purchase: { icon: 'ri-shopping-cart-2-line', iconBg: 'bg-sky-50', iconColor: 'text-sky-600', label: 'Purchase' },
  transfer: { icon: 'ri-swap-box-line', iconBg: 'bg-violet-50', iconColor: 'text-violet-500', label: 'Transfer' },
  return: { icon: 'ri-arrow-go-back-line', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', label: 'Return' },
  adjustment: { icon: 'ri-equalizer-2-line', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', label: 'Adjustment' },
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7);
      if (!error && data) {
        setActivities(data as Activity[]);
      }
      setLoading(false);
    }
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <i className="ri-loader-4-line animate-spin"></i>
          <span className="text-sm">Loading activity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Stock history & movements</p>
        </div>
        <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 cursor-pointer whitespace-nowrap">
          View History
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((act) => {
          const tc = typeConfig[act.type] || typeConfig.adjustment;
          const isNeg = act.quantity < 0;
          return (
            <div key={act.id} className="px-5 py-3.5 hover:bg-gray-50/40 transition-colors flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${tc.iconBg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${tc.icon} ${tc.iconColor} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{act.description}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{act.product} · {act.warehouse}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${isNeg ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isNeg ? '' : '+'}{act.quantity}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-gray-100">
        <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 cursor-pointer whitespace-nowrap">
          Load More <i className="ri-arrow-down-s-line"></i>
        </button>
      </div>
    </div>
  );
}