import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import OrderStatusBadge from './components/OrderStatusBadge';
import OrderDetailModal from './components/OrderDetailModal';
import { Order, OrderStatus } from '@/mocks/orders';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/contexts/CurrencyContext';

type FilterStatus = 'all' | OrderStatus;

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    customer: row.customer as string,
    email: row.email as string,
    phone: row.phone as string,
    address: row.address as string,
    city: row.city as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    status: row.status as OrderStatus,
    total: row.total as number,
    itemCount: row.item_count as number,
    vendorSplits: (row.vendor_splits as unknown as Order['vendorSplits']) || [],
    notes: row.notes as string | undefined,
  };
}

export default function OrdersPage() {
  const { formatAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setOrders((data || []).map(mapOrder));
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, search]);

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    accepted: orders.filter((o) => o.status === 'accepted').length,
    partial: orders.filter((o) => o.status === 'partial').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    fulfilled: orders.filter((o) => o.status === 'fulfilled').length,
  }), [orders]);

  const handleUpdateOrder = async (updated: Order) => {
    const { error } = await supabase.from('orders').update({
      status: updated.status,
      vendor_splits: updated.vendorSplits,
      updated_at: updated.updatedAt,
    }).eq('id', updated.id);

    if (error) {
      console.error(error);
    } else {
      setSelectedOrder(updated);
      await fetchOrders();
    }
  };

  const totalRevenue = useMemo(() =>
    orders.filter((o) => ['accepted', 'processing', 'fulfilled'].includes(o.status)).reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'partial', label: 'Partial' },
    { key: 'processing', label: 'Processing' },
    { key: 'fulfilled', label: 'Fulfilled' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <DashboardLayout title="Orders" subtitle="Review, accept, reject and manage multi-vendor order splits.">
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center mr-3">
            <i className="ri-loader-4-line animate-spin text-xl"></i>
          </div>
          <span className="text-sm">Loading orders...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Orders', value: orders.length, icon: 'ri-shopping-bag-3-line', color: 'text-gray-800', bg: 'bg-gray-100' },
              { label: 'Pending Review', value: counts.pending, icon: 'ri-time-line', color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Accepted / Processing', value: counts.accepted + counts.processing, icon: 'ri-checkbox-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Revenue (Accepted)', value: formatAmount(totalRevenue), icon: 'ri-money-dollar-circle-line', color: 'text-violet-700', bg: 'bg-violet-50' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${kpi.bg}`}>
                  <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-400">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Panel */}
          <div className="bg-white rounded-2xl">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-1 flex-wrap">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterStatus(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${filterStatus === tab.key ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {tab.label}
                    {tab.key !== 'all' && <span className="ml-1 text-gray-400">{counts[tab.key as OrderStatus]}</span>}
                    {tab.key === 'all' && <span className="ml-1 text-gray-400">{counts.all}</span>}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order ID or customer..."
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendors</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((order) => {
                    const vendors = [...new Set(order.vendorSplits.map((s) => s.vendor))];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-semibold text-gray-800">{order.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{order.customer}</p>
                            <p className="text-xs text-gray-400">{order.city}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {vendors.slice(0, 2).map((v) => (
                              <span key={v} className="text-xs text-gray-500 flex items-center gap-1">
                                <i className="ri-store-2-line text-gray-400"></i> {v}
                              </span>
                            ))}
                            {vendors.length > 2 && (
                              <span className="text-xs text-gray-400">+{vendors.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600 font-medium">{order.itemCount}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800">{formatAmount(order.total)}</td>
                        <td className="py-3 px-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{order.createdAt}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 cursor-pointer whitespace-nowrap transition-colors"
                          >
                            {order.status === 'pending' ? 'Review' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-12 h-12 flex items-center justify-center mb-3">
                  <i className="ri-shopping-bag-3-line text-4xl"></i>
                </div>
                <p className="text-sm">No orders found for the selected filter.</p>
              </div>
            )}

            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">Showing {filtered.length} of {orders.length} orders</p>
              <p className="text-xs text-gray-400">Last updated: 19 May 2026, 13:05</p>
            </div>
          </div>
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={handleUpdateOrder}
        />
      )}
    </DashboardLayout>
  );
}