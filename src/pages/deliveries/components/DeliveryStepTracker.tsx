import { DeliveryStep } from '@/mocks/deliveries';

interface DeliveryStepTrackerProps {
  currentStatus: DeliveryStep;
  compact?: boolean;
}

const steps: { key: DeliveryStep; label: string; icon: string }[] = [
  { key: 'prepare', label: 'Preparing', icon: 'ri-inbox-archive-line' },
  { key: 'ready', label: 'Ready', icon: 'ri-checkbox-circle-line' },
  { key: 'in_transit', label: 'In Transit', icon: 'ri-truck-line' },
  { key: 'delivered', label: 'Delivered', icon: 'ri-map-pin-2-line' },
];

const stepIndex: Record<DeliveryStep, number> = {
  prepare: 0,
  ready: 1,
  in_transit: 2,
  delivered: 3,
};

export default function DeliveryStepTracker({ currentStatus, compact = false }: DeliveryStepTrackerProps) {
  const current = stepIndex[currentStatus];

  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const completed = idx < current;
        const active = idx === current;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step node */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center transition-all ${
                completed ? 'bg-emerald-500' : active ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-100'
              }`}>
                <i className={`${step.icon} ${compact ? 'text-xs' : 'text-sm'} ${completed || active ? 'text-white' : 'text-gray-400'}`}></i>
              </div>
              {!compact && (
                <p className={`text-xs mt-1.5 font-medium ${active ? 'text-emerald-700' : completed ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              )}
            </div>
            {/* Connector */}
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${completed ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}