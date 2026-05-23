import {
  monthlySnapshots,
  topProducts,
  categoryBreakdown,
  returnReasonBreakdown,
  warehousePerformance,
  vendorPerformance,
} from '@/mocks/reports';

// ─── CSV helpers ────────────────────────────────────────────────────────────

function toCsvRow(values: (string | number)[]): string {
  return values.map((v) => {
    const str = String(v);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }).join(',');
}

function downloadCsv(filename: string, rows: string[]): void {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── CSV exports ─────────────────────────────────────────────────────────────

export function exportMonthlySnapshotCsv(): void {
  const header = toCsvRow(['Month', 'Revenue (RM)', 'Orders', 'Returns', 'Transfers', 'Purchases', 'Avg Order Value (RM)']);
  const dataRows = monthlySnapshots.map((m) =>
    toCsvRow([m.month, m.revenue, m.orders, m.returns, m.transfers, m.purchases, m.avgOrderValue.toFixed(2)])
  );
  const ytdRevenue = monthlySnapshots.reduce((s, m) => s + m.revenue, 0);
  const ytdOrders = monthlySnapshots.reduce((s, m) => s + m.orders, 0);
  const ytdReturns = monthlySnapshots.reduce((s, m) => s + m.returns, 0);
  const ytdTransfers = monthlySnapshots.reduce((s, m) => s + m.transfers, 0);
  const ytdPurchases = monthlySnapshots.reduce((s, m) => s + m.purchases, 0);
  const avgAov = (monthlySnapshots.reduce((s, m) => s + m.avgOrderValue, 0) / monthlySnapshots.length).toFixed(2);
  const totalsRow = toCsvRow(['YTD Total', ytdRevenue, ytdOrders, ytdReturns, ytdTransfers, ytdPurchases, avgAov]);
  downloadCsv('StockManagement_Monthly_Report.csv', [header, ...dataRows, totalsRow]);
}

export function exportTopProductsCsv(): void {
  const header = toCsvRow(['Rank', 'Product Name', 'SKU', 'Category', 'Units Sold', 'Revenue (RM)', 'Return Rate (%)', 'Trend']);
  const dataRows = topProducts.map((p, i) =>
    toCsvRow([i + 1, p.productName, p.sku, p.category, p.unitsSold, p.revenue.toFixed(2), p.returnRate, p.trend])
  );
  downloadCsv('StockManagement_Top_Products.csv', [header, ...dataRows]);
}

export function exportCategoryBreakdownCsv(): void {
  const header = toCsvRow(['Category', 'Revenue (RM)', 'Units Sold', 'Return Rate (%)']);
  const dataRows = categoryBreakdown.map((c) =>
    toCsvRow([c.category, c.revenue.toFixed(2), c.unitsSold, c.returnRate])
  );
  downloadCsv('StockManagement_Category_Breakdown.csv', [header, ...dataRows]);
}

export function exportReturnReasonsCsv(): void {
  const header = toCsvRow(['Return Reason', 'Count', 'Value (RM)', 'Percentage (%)']);
  const dataRows = returnReasonBreakdown.map((r) =>
    toCsvRow([r.reason, r.count, r.value.toFixed(2), r.percentage])
  );
  downloadCsv('StockManagement_Return_Reasons.csv', [header, ...dataRows]);
}

export function exportWarehousePerformanceCsv(): void {
  const header = toCsvRow(['Warehouse', 'Inbound Units', 'Outbound Units', 'Returns', 'Fulfillment Rate (%)', 'Avg Processing Days']);
  const dataRows = warehousePerformance.map((w) =>
    toCsvRow([w.warehouse, w.inbound, w.outbound, w.returns, w.fulfillmentRate, w.avgProcessingDays])
  );
  downloadCsv('StockManagement_Warehouse_Performance.csv', [header, ...dataRows]);
}

export function exportVendorPerformanceCsv(): void {
  const header = toCsvRow(['Vendor', 'Fulfillment Rate (%)', 'Total Orders', 'Rejected', 'Avg Delivery Days', 'Revenue (RM)']);
  const dataRows = vendorPerformance.map((v) =>
    toCsvRow([v.vendor, v.fulfillmentRate, v.totalOrders, v.rejectedOrders, v.avgDeliveryDays, v.revenue])
  );
  downloadCsv('StockManagement_Vendor_Performance.csv', [header, ...dataRows]);
}

export function exportAllReportsCsv(): void {
  const sections: string[] = [];

  sections.push('STOCKMANAGEMENT — FULL REPORTS EXPORT');
  sections.push(`Generated: ${new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  sections.push('');

  sections.push('=== MONTHLY SNAPSHOT ===');
  sections.push(toCsvRow(['Month', 'Revenue (RM)', 'Orders', 'Returns', 'Transfers', 'Purchases', 'Avg Order Value (RM)']));
  monthlySnapshots.forEach((m) =>
    sections.push(toCsvRow([m.month, m.revenue, m.orders, m.returns, m.transfers, m.purchases, m.avgOrderValue.toFixed(2)]))
  );
  sections.push('');

  sections.push('=== TOP PRODUCTS ===');
  sections.push(toCsvRow(['Rank', 'Product Name', 'SKU', 'Category', 'Units Sold', 'Revenue (RM)', 'Return Rate (%)', 'Trend']));
  topProducts.forEach((p, i) =>
    sections.push(toCsvRow([i + 1, p.productName, p.sku, p.category, p.unitsSold, p.revenue.toFixed(2), p.returnRate, p.trend]))
  );
  sections.push('');

  sections.push('=== CATEGORY BREAKDOWN ===');
  sections.push(toCsvRow(['Category', 'Revenue (RM)', 'Units Sold', 'Return Rate (%)']));
  categoryBreakdown.forEach((c) =>
    sections.push(toCsvRow([c.category, c.revenue.toFixed(2), c.unitsSold, c.returnRate]))
  );
  sections.push('');

  sections.push('=== RETURN REASONS ===');
  sections.push(toCsvRow(['Return Reason', 'Count', 'Value (RM)', 'Percentage (%)']));
  returnReasonBreakdown.forEach((r) =>
    sections.push(toCsvRow([r.reason, r.count, r.value.toFixed(2), r.percentage]))
  );
  sections.push('');

  sections.push('=== WAREHOUSE PERFORMANCE ===');
  sections.push(toCsvRow(['Warehouse', 'Inbound', 'Outbound', 'Returns', 'Fulfillment Rate (%)', 'Avg Processing Days']));
  warehousePerformance.forEach((w) =>
    sections.push(toCsvRow([w.warehouse, w.inbound, w.outbound, w.returns, w.fulfillmentRate, w.avgProcessingDays]))
  );
  sections.push('');

  sections.push('=== VENDOR PERFORMANCE ===');
  sections.push(toCsvRow(['Vendor', 'Fulfillment Rate (%)', 'Total Orders', 'Rejected', 'Avg Delivery Days', 'Revenue (RM)']));
  vendorPerformance.forEach((v) =>
    sections.push(toCsvRow([v.vendor, v.fulfillmentRate, v.totalOrders, v.rejectedOrders, v.avgDeliveryDays, v.revenue]))
  );

  downloadCsv('StockManagement_Full_Report.csv', sections);
}

// ─── PDF export (browser print + styled HTML) ────────────────────────────────

export function exportReportsPdf(): void {
  const latest = monthlySnapshots[monthlySnapshots.length - 1];
  const previous = monthlySnapshots[monthlySnapshots.length - 2];
  const revGrowth = (((latest.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1);
  const returnRate = ((latest.returns / latest.orders) * 100).toFixed(1);
  const ytdRevenue = monthlySnapshots.reduce((s, m) => s + m.revenue, 0);
  const ytdOrders = monthlySnapshots.reduce((s, m) => s + m.orders, 0);
  const generatedDate = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });

  const monthlyRows = monthlySnapshots.map((m, i) => {
    const prev = monthlySnapshots[i - 1];
    const growth = prev ? (((m.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
    const growthHtml = growth
      ? `<span style="font-size:11px;color:${Number(growth) >= 0 ? '#10b981' : '#ef4444'};margin-left:6px">${Number(growth) >= 0 ? '+' : ''}${growth}%</span>`
      : '';
    return `<tr>
      <td>${m.month}${i === monthlySnapshots.length - 1 ? ' <span style="color:#10b981;font-size:11px">(current)</span>' : ''}</td>
      <td style="text-align:right;font-weight:600">RM ${m.revenue.toLocaleString('en-MY')}${growthHtml}</td>
      <td style="text-align:right">${m.orders}</td>
      <td style="text-align:right;color:${m.returns > 30 ? '#ef4444' : '#f59e0b'}">${m.returns}</td>
      <td style="text-align:right">${m.transfers}</td>
      <td style="text-align:right">${m.purchases}</td>
      <td style="text-align:right">RM ${m.avgOrderValue.toFixed(2)}</td>
    </tr>`;
  }).join('');

  const productRows = topProducts.map((p, i) => {
    const returnColor = p.returnRate > 5 ? '#ef4444' : p.returnRate > 2.5 ? '#f59e0b' : '#10b981';
    const trendColor = p.trend === 'up' ? '#10b981' : p.trend === 'down' ? '#ef4444' : '#9ca3af';
    const trendLabel = p.trend === 'up' ? '▲ Rising' : p.trend === 'down' ? '▼ Falling' : '→ Stable';
    return `<tr>
      <td style="text-align:center;color:#9ca3af">#${i + 1}</td>
      <td><strong>${p.productName}</strong><br><span style="color:#9ca3af;font-size:11px">${p.sku} · ${p.category}</span></td>
      <td style="text-align:right">${p.unitsSold}</td>
      <td style="text-align:right;font-weight:600">RM ${p.revenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
      <td style="text-align:right;color:${returnColor};font-weight:600">${p.returnRate}%</td>
      <td style="text-align:center;color:${trendColor};font-size:11px">${trendLabel}</td>
    </tr>`;
  }).join('');

  const warehouseRows = warehousePerformance.map((w) => {
    const rateColor = w.fulfillmentRate >= 92 ? '#10b981' : w.fulfillmentRate >= 85 ? '#f59e0b' : '#ef4444';
    return `<tr>
      <td><strong>${w.warehouse}</strong></td>
      <td style="text-align:right">${w.inbound.toLocaleString()}</td>
      <td style="text-align:right">${w.outbound.toLocaleString()}</td>
      <td style="text-align:right">${w.returns}</td>
      <td style="text-align:right;color:${rateColor};font-weight:600">${w.fulfillmentRate}%</td>
      <td style="text-align:right">${w.avgProcessingDays} days</td>
    </tr>`;
  }).join('');

  const vendorRows = vendorPerformance.map((v, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const rateColor = v.fulfillmentRate >= 95 ? '#10b981' : v.fulfillmentRate >= 85 ? '#f59e0b' : '#ef4444';
    return `<tr>
      <td style="text-align:center">${medal}</td>
      <td><strong>${v.vendor}</strong></td>
      <td style="text-align:right;color:${rateColor};font-weight:600">${v.fulfillmentRate}%</td>
      <td style="text-align:right">${v.totalOrders}</td>
      <td style="text-align:right;color:${v.rejectedOrders > 0 ? '#ef4444' : '#10b981'}">${v.rejectedOrders}</td>
      <td style="text-align:right">${v.avgDeliveryDays} days</td>
      <td style="text-align:right;font-weight:600">RM ${v.revenue.toLocaleString('en-MY')}</td>
    </tr>`;
  }).join('');

  const returnRows = returnReasonBreakdown.map((r) => `<tr>
    <td>${r.reason}</td>
    <td style="text-align:right">${r.count}</td>
    <td style="text-align:right">RM ${r.value.toFixed(2)}</td>
    <td style="text-align:right">${r.percentage}%</td>
  </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>StockManagement Reports — ${generatedDate}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111827; background: #fff; }
  .page { padding: 32px 40px; max-width: 960px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px solid #10b981; margin-bottom: 28px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon { width: 36px; height: 36px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
  .brand-name { font-size: 20px; font-weight: 700; color: #111827; }
  .brand-sub { font-size: 12px; color: #9ca3af; }
  .meta { text-align: right; color: #6b7280; font-size: 12px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .kpi-card { background: #f9fafb; border-radius: 10px; padding: 16px; }
  .kpi-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .kpi-value { font-size: 20px; font-weight: 700; color: #111827; }
  .kpi-sub { font-size: 11px; margin-top: 4px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 14px; font-weight: 700; color: #111827; border-left: 3px solid #10b981; padding-left: 10px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .tfoot-row td { font-weight: 700; background: #f0fdf4; border-top: 2px solid #d1fae5; }
  .footer { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">&#9632;</div>
      <div>
        <div class="brand-name">StockManagement</div>
        <div class="brand-sub">Admin Panel — Reports &amp; Analytics</div>
      </div>
    </div>
    <div class="meta">
      <div style="font-weight:600;color:#111827;font-size:14px">Full Report</div>
      <div>Generated: ${generatedDate}</div>
      <div>Period: Jan 2026 – May 2026</div>
    </div>
  </div>

  <!-- KPI Strip -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">This Month Revenue</div>
      <div class="kpi-value" style="color:#10b981">RM ${(latest.revenue / 1000).toFixed(1)}k</div>
      <div class="kpi-sub" style="color:${Number(revGrowth) >= 0 ? '#10b981' : '#ef4444'}">${Number(revGrowth) >= 0 ? '+' : ''}${revGrowth}% vs last month</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">YTD Revenue</div>
      <div class="kpi-value">RM ${(ytdRevenue / 1000).toFixed(1)}k</div>
      <div class="kpi-sub" style="color:#6b7280">${ytdOrders} total orders</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Return Rate</div>
      <div class="kpi-value" style="color:#f59e0b">${returnRate}%</div>
      <div class="kpi-sub" style="color:#6b7280">${latest.returns} returns this month</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Top Product</div>
      <div class="kpi-value" style="font-size:15px">${topProducts[0].productName.substring(0, 18)}…</div>
      <div class="kpi-sub" style="color:#6b7280">${topProducts[0].unitsSold} units · RM ${(topProducts[0].revenue / 1000).toFixed(1)}k</div>
    </div>
  </div>

  <!-- Monthly Snapshot -->
  <div class="section">
    <div class="section-title">Monthly Snapshot (YTD)</div>
    <table>
      <thead><tr>
        <th>Month</th><th style="text-align:right">Revenue</th><th style="text-align:right">Orders</th>
        <th style="text-align:right">Returns</th><th style="text-align:right">Transfers</th>
        <th style="text-align:right">Purchases</th><th style="text-align:right">Avg Order</th>
      </tr></thead>
      <tbody>${monthlyRows}</tbody>
      <tfoot><tr class="tfoot-row">
        <td>YTD Total</td>
        <td style="text-align:right;color:#10b981">RM ${ytdRevenue.toLocaleString('en-MY')}</td>
        <td style="text-align:right">${ytdOrders}</td>
        <td style="text-align:right;color:#f59e0b">${monthlySnapshots.reduce((s, m) => s + m.returns, 0)}</td>
        <td style="text-align:right">${monthlySnapshots.reduce((s, m) => s + m.transfers, 0)}</td>
        <td style="text-align:right">${monthlySnapshots.reduce((s, m) => s + m.purchases, 0)}</td>
        <td style="text-align:right">RM ${(monthlySnapshots.reduce((s, m) => s + m.avgOrderValue, 0) / monthlySnapshots.length).toFixed(2)}</td>
      </tr></tfoot>
    </table>
  </div>

  <!-- Top Products -->
  <div class="section">
    <div class="section-title">Top 10 Products by Revenue</div>
    <table>
      <thead><tr>
        <th style="text-align:center">#</th><th>Product</th><th style="text-align:right">Units Sold</th>
        <th style="text-align:right">Revenue</th><th style="text-align:right">Return Rate</th><th style="text-align:center">Trend</th>
      </tr></thead>
      <tbody>${productRows}</tbody>
    </table>
  </div>

  <!-- Warehouse Performance -->
  <div class="section">
    <div class="section-title">Warehouse Performance</div>
    <table>
      <thead><tr>
        <th>Warehouse</th><th style="text-align:right">Inbound</th><th style="text-align:right">Outbound</th>
        <th style="text-align:right">Returns</th><th style="text-align:right">Fulfillment</th><th style="text-align:right">Avg Processing</th>
      </tr></thead>
      <tbody>${warehouseRows}</tbody>
    </table>
  </div>

  <!-- Vendor Performance -->
  <div class="section">
    <div class="section-title">Vendor Performance Rankings</div>
    <table>
      <thead><tr>
        <th style="text-align:center">Rank</th><th>Vendor</th><th style="text-align:right">Fulfillment</th>
        <th style="text-align:right">Total Orders</th><th style="text-align:right">Rejected</th>
        <th style="text-align:right">Avg Delivery</th><th style="text-align:right">Revenue</th>
      </tr></thead>
      <tbody>${vendorRows}</tbody>
    </table>
  </div>

  <!-- Return Reasons -->
  <div class="section">
    <div class="section-title">Return Reasons Breakdown</div>
    <table>
      <thead><tr>
        <th>Reason</th><th style="text-align:right">Count</th>
        <th style="text-align:right">Value (RM)</th><th style="text-align:right">% of Returns</th>
      </tr></thead>
      <tbody>${returnRows}</tbody>
    </table>
  </div>

  <div class="footer">StockManagement Admin Panel &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Generated ${generatedDate}</div>
</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}