import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import { type ReturnRequest, type ReturnStatus } from '@/mocks/returns';
import ReturnStatusBadge from './components/ReturnStatusBadge';
import ReturnDetailModal from './components/ReturnDetailModal';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/contexts/CurrencyContext';

type FilterTab = 'all' | ReturnStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'inspecting', label: 'Inspecting' },
  { key: 'approved', label: 'Approved' },
  { key: 'restocked', label: 'Restocked' },
  { key: 'discarded', label: 'Discarded' },
  { key: 'refunded', label: 'Refunded' },
];

const reasonLabels: Record<string, string> = {
  wrong_item: 'Wrong Item',
  damaged: 'Damaged',
  defective: 'Defective',
  not_as_described: 'Not As Described',
  changed_mind: 'Changed Mind',
  other: 'Other',
};

const refundMethodLabels: Record<string, string> = {
  original_payment: 'Original Payment',
  store_credit: 'Store Credit',
  bank_transfer: 'Bank Transfer',
  none: 'No Refund',
};

function mapReturn(row: Record<string, unknown>): ReturnRequest {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    customer: row.customer as string,
    email: row.email as string,
    phone: row.phone as string,
    status: row.status as ReturnStatus,
    items: (row.items as unknown as ReturnRequest['items']) || [],
    totalItems: row.total_items as number,
    totalValue: row.total_value as number,
    reason: row.reason as ReturnRequest['reason'],
    reasonNote: row.reason_note as string | undefined,
    refundMethod: row.refund_method as ReturnRequest['refundMethod'],
    refundAmount: row.refund_amount as number,
    warehouse: row.warehouse as 'BM Warehouse' | 'Vendor Warehouse',
    assignedTo: row.assigned_to as string | undefined,
    inspectionNotes: row.inspection_notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    completedAt: row.completed_at as string | undefined,
  };
}

export default function ReturnsPage() {
  const { formatAmount } = useCurrency();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('returns').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setReturns((data || []).map(mapReturn));
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      const matchTab = activeTab === 'all' || r.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [returns, activeTab, search]);

  const kpi = useMemo(() => ({
    pending: returns.filter((r) => r.status === 'pending').length,
    inspecting: returns.filter((r) => r.status === 'inspecting').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    restocked: returns.filter((r) => r.status === 'restocked').length,
    discarded: returns.filter((r) => r.status === 'discarded').length,
    totalRefund: returns.filter((r) => r.status === 'refunded' || r.status === 'restocked').reduce((s, r) => s + r.refundAmount, 0),
  }), [returns]);

  const handleUpdate = async (id: string, updates: Partial<ReturnRequest>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.items) dbUpdates.items = updates.items;
    if (updates.inspectionNotes !== undefined) dbUpdates.inspection_notes = updates.inspectionNotes;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.updatedAt) dbUpdates.updated_at = updates.updatedAt;
    if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;

    const { error } = await supabase.from('returns').update(dbUpdates).eq('id', id);
    if (error) {
      console.error(error);
    } else {
      const statusMessages: Partial<Record<ReturnStatus, string>> = {
        inspecting: 'Inspection started.',
        approved: 'Return approved!',
        restocked: 'Items restocked to inventory.',
        discarded: 'Items discarded.',
        refunded: 'Refund processed successfully!',
      };
      const newStatus = updates.status;
      if (newStatus && statusMessages[newStatus]) {
        setSuccessMsg(statusMessages[newStatus] ?? 'Updated.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
      await fetchReturns();
      if (selectedReturn?.id === id) {
        const refreshed = (await supabase.from('returns').select('*').eq('id', id).single()).data;
        if (refreshed) setSelectedReturn(mapReturn(refreshed));
      }
    }
  };

  const tabCount = (key: FilterTab) => key === 'all' ? returns.length : returns.filter((r) => r.status === key).length;

  return (
    <DashboardLayout title="Returns" subtitle="Manage customer return requests, inspection and refund processing">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow text-sm font-medium flex items-center gap-2">
          <i className="ri-checkbox-circle-line"></i>{successMsg}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center mr-3">
            <i className="ri-loader-4-line animate-spin text-xl"></i>
          </div>
          <span className="text-sm">Loading returns...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Pending Review', value: kpi.pending, icon: 'ri-time-line', color: 'text-amber-600', bg: 'bg-amber-50', click: 'pending' as FilterTab },
              { label: 'Under Inspection', value: kpi.inspecting, icon: 'ri-search-eye-line', color: 'text-sky-600', bg: 'bg-sky-50', click: 'inspecting' as FilterTab },
              { label: 'Approved', value: kpi.approved, icon: 'ri-checkbox-circle-line', color: 'text-violet-600', bg: 'bg-violet-50', click: 'approved' as FilterTab },
              { label: 'Restocked', value: kpi.restocked, icon: 'ri-archive-stack-line', color: 'text-emerald-600', bg: 'bg-emerald-50', click: 'restocked' as FilterTab },
              { label: 'Discarded', value: kpi.discarded, icon: 'ri-delete-bin-line', color: 'text-red-600', bg: 'bg-red-50', click: 'discarded' as FilterTab },
              { label: 'Total Refunded', value: formatAmount(kpi.totalRefund), icon: 'ri-refund-2-line', color: 'text-teal-600', bg: 'bg-teal-50', click: 'refunded' as FilterTab },
            ].map((card) => (
              <button
                key={card.label}
                onClick={() => setActiveTab(card.click)}
                className={`bg-white rounded-xl p-4 text-left border transition-all cursor-pointer ${activeTab === card.click ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <i className={`${card.icon} ${card.color}`}></i>
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </button>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                      {tabCount(tab.key)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search returns, customer, product…"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-60 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Return ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product(s)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Refund Method</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-sm text-gray-400">
                        <i className="ri-arrow-go-back-line text-3xl block mb-2"></i>
                        No return requests found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold text-gray-900 text-sm">{r.id}</span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-sm font-medium">{r.orderId}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-800 text-sm">{r.customer}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-700 text-sm">{r.items[0].productName}</p>
                          {r.items.length > 1 && <p className="text-xs text-gray-400">+{r.items.length - 1} more</p>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-600">{reasonLabels[r.reason]}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-600">{refundMethodLabels[r.refundMethod]}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                          {formatAmount(r.refundAmount)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <ReturnStatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs">{r.createdAt.split(' ')[0]}</td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedReturn(r)}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer whitespace-nowrap"
                          >
                            {['pending', 'inspecting', 'approved'].includes(r.status) ? 'Process' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {returns.length} return requests
            </div>
          </div>
        </>
      )}

      {selectedReturn && (
        <ReturnDetailModal
          ret={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onUpdate={handleUpdate}
        />
      )}
    </DashboardLayout>
  );
}