import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import DeliveryStepTracker from './components/DeliveryStepTracker';
import DeliveryDetailModal from './components/DeliveryDetailModal';
import { DeliveryRecord, DeliveryStep } from '@/mocks/deliveries';
import { supabase } from '@/lib/supabase';

const stepIndex: Record<DeliveryStep, number> = { prepare: 0, ready: 1, in_transit: 2, delivered: 3 };

const statusConfig = {
  prepare: { label: 'Preparing', cls: 'bg-amber-50 text-amber-700', icon: 'ri-inbox-archive-line' },
  ready: { label: 'Ready', cls: 'bg-violet-50 text-violet-700', icon: 'ri-checkbox-circle-line' },
  in_transit: { label: 'In Transit', cls: 'bg-sky-50 text-sky-700', icon: 'ri-truck-line' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700', icon: 'ri-map-pin-2-line' },
};

type FilterStatus = 'all' | DeliveryStep;

function rowToRecord(row: any): DeliveryRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    customer: row.customer,
    email: row.email ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    city: row.destination ?? '',
    items: Array.isArray(row.items_detail) ? row.items_detail : [],
    totalItems: row.items ?? 0,
    status: row.status as DeliveryStep,
    carrier: row.carrier ?? '',
    trackingNumber: row.tracking_number ?? '',
    warehouse: row.warehouse ?? '',
    estimatedDelivery: row.estimated_delivery ?? '',
    createdAt: row.last_update ?? '',
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
  };
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setDeliveries((data as any[]).map(rowToRecord));
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      const matchSearch =
        d.orderId.toLowerCase().includes(search.toLowerCase()) ||
        d.customer.toLowerCase().includes(search.toLowerCase()) ||
        d.trackingNumber.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [deliveries, filterStatus, search]);

  const counts = useMemo(() => ({
    all: deliveries.length,
    prepare: deliveries.filter((d) => d.status === 'prepare').length,
    ready: deliveries.filter((d) => d.status === 'ready').length,
    in_transit: deliveries.filter((d) => d.status === 'in_transit').length,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
  }), [deliveries]);

  const handleAdvance = async (id: string, nextStep: DeliveryStep, note: string) => {
    const now = new Date().toLocaleString('sv').replace('T', ' ').slice(0, 16);
    const target = deliveries.find((d) => d.id === id);
    if (!target) return;

    const newTimeline = [...target.timeline, { step: nextStep, timestamp: now, note, completedBy: 'Admin' }];

    await supabase
      .from('deliveries')
      .update({ status: nextStep, timeline: newTimeline, last_update: now })
      .eq('id', id);

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated: DeliveryRecord = { ...d, status: nextStep, timeline: newTimeline };
        if (selectedDelivery?.id === id) setSelectedDelivery(updated);
        return updated;
      })
    );
    showToast(`Delivery advanced to: ${nextStep.replace('_', ' ')}`);
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'prepare', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <DashboardLayout title="Deliveries" subtitle="Track shipments, advance delivery stages, and confirm arrivals.">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white shadow-lg">
          <i className="ri-check-line text-base"></i> {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {([
          { key: 'prepare', label: 'Preparing', value: counts.prepare },
          { key: 'ready', label: 'Ready', value: counts.ready },
          { key: 'in_transit', label: 'In Transit', value: counts.in_transit },
          { key: 'delivered', label: 'Delivered', value: counts.delivered },
        ] as { key: DeliveryStep; label: string; value: number }[]).map((kpi) => {
          const cfg = statusConfig[kpi.key];
          return (
            <div
              key={kpi.key}
              onClick={() => setFilterStatus(kpi.key)}
              className={`bg-white rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer transition-all border-2 ${filterStatus === kpi.key ? 'border-emerald-300' : 'border-transparent hover:border-gray-200'}`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${cfg.cls}`}>
                <i className={`${cfg.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-400">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${filterStatus === tab.key ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab.label}
                <span className="ml-1 text-gray-400">{tab.key === 'all' ? counts.all : counts[tab.key as DeliveryStep]}</span>
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
              placeholder="Search order, customer, tracking..."
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <i className="ri-loader-4-line text-3xl animate-spin mr-2"></i>
            <span className="text-sm">Loading deliveries…</span>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((delivery) => {
              const cfg = statusConfig[delivery.status];
              const canAdvance = delivery.status !== 'delivered';
              return (
                <div key={delivery.id} className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition-all cursor-pointer group" onClick={() => setSelectedDelivery(delivery)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-800">{delivery.orderId}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">{delivery.customer}</p>
                      <p className="text-xs text-gray-400">{delivery.city}</p>
                    </div>
                    {canAdvance && (
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-arrow-right-line text-emerald-600 text-sm"></i>
                      </div>
                    )}
                    {!canAdvance && (
                      <div className="w-7 h-7 flex items-center justify-center">
                        <i className="ri-check-double-line text-emerald-500 text-lg"></i>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <DeliveryStepTracker currentStatus={delivery.status} compact />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-truck-line text-gray-400"></i>
                      </div>
                      <span>{delivery.carrier}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono">{delivery.trackingNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-box-3-line text-gray-400"></i>
                      </div>
                      <span>{delivery.totalItems} item{delivery.totalItems !== 1 ? 's' : ''}</span>
                      <span className="text-gray-300">·</span>
                      <span>{delivery.warehouse}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-calendar-line text-gray-400"></i>
                      </div>
                      <span>Est. {delivery.estimatedDelivery}</span>
                    </div>
                  </div>

                  {delivery.timeline.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        <i className="ri-time-line mr-1"></i>
                        Last: {delivery.timeline[delivery.timeline.length - 1].timestamp}
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${((stepIndex[delivery.status] + 1) / 4) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Step {stepIndex[delivery.status] + 1} of 4</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-12 h-12 flex items-center justify-center mb-3">
              <i className="ri-truck-line text-4xl"></i>
            </div>
            <p className="text-sm">No deliveries match your current filter.</p>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {deliveries.length} deliveries</p>
          <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {selectedDelivery && (
        <DeliveryDetailModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onAdvance={handleAdvance}
        />
      )}
    </DashboardLayout>
  );
}
