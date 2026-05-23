import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import RevenueChart from './components/RevenueChart';
import TopProductsTable from './components/TopProductsTable';
import CategoryBreakdownChart from './components/CategoryBreakdownChart';
import ReturnReasonsChart from './components/ReturnReasonsChart';
import WarehousePerformancePanel from './components/WarehousePerformancePanel';
import MonthlySnapshotTable from './components/MonthlySnapshotTable';
import ExportMenu from './components/ExportMenu';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SnapshotRow { revenue: number; orders: number; returns: number; }
interface TopProductRow { sku: string; revenue: number; units_sold: number; }
interface WarehouseRow { warehouse: string; fulfillment_rate: number; }

export default function ReportsPage() {
  const { formatAmount } = useCurrency();
  const [latestSnapshot, setLatestSnapshot] = useState<SnapshotRow | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<SnapshotRow | null>(null);
  const [topProduct, setTopProduct] = useState<TopProductRow | null>(null);
  const [avgFulfillment, setAvgFulfillment] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    const [snapshotRes, topProdRes, warehouseRes] = await Promise.all([
      supabase.from('monthly_snapshots').select('revenue, orders, returns').order('month', { ascending: false }).limit(2),
      supabase.from('top_products').select('sku, revenue, units_sold').order('revenue', { ascending: false }).limit(1),
      supabase.from('warehouse_performance').select('warehouse, fulfillment_rate'),
    ]);

    if (snapshotRes.data && snapshotRes.data.length >= 2) {
      setLatestSnapshot(snapshotRes.data[0]);
      setPreviousSnapshot(snapshotRes.data[1]);
    } else if (snapshotRes.data && snapshotRes.data.length === 1) {
      setLatestSnapshot(snapshotRes.data[0]);
    }
    if (topProdRes.data && topProdRes.data.length > 0) {
      setTopProduct(topProdRes.data[0]);
    }
    if (warehouseRes.data && warehouseRes.data.length > 0) {
      const avg = warehouseRes.data.reduce((s: number, w: WarehouseRow) => s + (w.fulfillment_rate || 0), 0) / warehouseRes.data.length;
      setAvgFulfillment(avg);
    }
    setLoading(false);
  };

  const latest = latestSnapshot;
  const previous = previousSnapshot;
  const revGrowth = latest && previous && previous.revenue > 0
    ? (((latest.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)
    : '0.0';
  const orderGrowth = latest && previous && previous.orders > 0
    ? (((latest.orders - previous.orders) / previous.orders) * 100).toFixed(1)
    : '0.0';
  const returnRate = latest && latest.orders > 0 ? ((latest.returns / latest.orders) * 100).toFixed(1) : '0.0';

  return (
    <DashboardLayout title="Reports &amp; Analytics" subtitle="Revenue trends, product performance, return analysis, and warehouse metrics">

      {/* Page header row with export buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Overview — May 2026</h3>
          <p className="text-xs text-gray-400 mt-0.5">Jan 2026 – May 2026 · All warehouses</p>
        </div>
        <ExportMenu />
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-lg mb-3"></div>
              <div className="h-6 bg-gray-100 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-24"></div>
            </div>
          ))
        ) : [
          {
            label: 'This Month Revenue',
            value: latest ? formatAmount(latest.revenue) : '—',
            sub: `${Number(revGrowth) >= 0 ? '+' : ''}${revGrowth}% vs last month`,
            icon: 'ri-money-dollar-circle-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            subColor: Number(revGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500',
          },
          {
            label: 'Orders This Month',
            value: latest?.orders ?? '—',
            sub: `${Number(orderGrowth) >= 0 ? '+' : ''}${orderGrowth}% vs last month`,
            icon: 'ri-shopping-bag-3-line',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            subColor: Number(orderGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500',
          },
          {
            label: 'Return Rate',
            value: `${returnRate}%`,
            sub: `${latest?.returns ?? 0} returns this month`,
            icon: 'ri-arrow-go-back-line',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            subColor: 'text-amber-600',
          },
          {
            label: 'Top Product',
            value: topProduct?.sku ?? '—',
            sub: topProduct ? `${topProduct.units_sold} units · ${formatAmount(topProduct.revenue)}` : 'No data',
            icon: 'ri-trophy-line',
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            subColor: 'text-gray-400',
          },
          {
            label: 'Avg Fulfillment',
            value: `${avgFulfillment.toFixed(1)}%`,
            sub: 'Across all warehouses',
            icon: 'ri-bar-chart-2-line',
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            subColor: 'text-gray-400',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <i className={`${card.icon} ${card.color}`}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            <p className={`text-xs font-medium mt-1 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Revenue Chart (full width) */}
      <div className="mb-5">
        <RevenueChart />
      </div>

      {/* Row 2: Top Products + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3">
          <TopProductsTable />
        </div>
        <div className="lg:col-span-2">
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* Row 3: Monthly Snapshot Table */}
      <div className="mb-5">
        <MonthlySnapshotTable />
      </div>

      {/* Row 4: Return Reasons + Warehouse & Vendor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <ReturnReasonsChart />
        </div>
        <div className="lg:col-span-3">
          <WarehousePerformancePanel />
        </div>
      </div>
    </DashboardLayout>
  );
}