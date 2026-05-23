import type { PromotionStatus } from '@/mocks/promotions';

const config: Record<PromotionStatus, { label: string; classes: string; icon: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 border border-gray-200', icon: 'ri-draft-line' },
  scheduled: { label: 'Scheduled', classes: 'bg-sky-50 text-sky-700 border border-sky-200', icon: 'ri-calendar-schedule-line' },
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-flashlight-line' },
  paused: { label: 'Paused', classes: 'bg-amber-50 text-amber-700 border border-amber-200', icon: 'ri-pause-circle-line' },
  expired: { label: 'Expired', classes: 'bg-red-50 text-red-500 border border-red-200', icon: 'ri-time-line' },
};

export default function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.classes} whitespace-nowrap`}>
      <i className={c.icon}></i>
      {c.label}
    </span>
  );
}