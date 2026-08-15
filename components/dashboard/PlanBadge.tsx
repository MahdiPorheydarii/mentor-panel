import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/lib/types';

const config: Record<SubscriptionPlan, { label: string; className: string; dotColor: string }> = {
  premium: {
    label: 'پریمیوم ⭐',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  vip: {
    label: 'VIP 💎',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
    dotColor: 'bg-violet-500',
  },
  economy: {
    label: 'اقتصادی',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
};

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const { label, className, dotColor } = config[plan];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
      {label}
    </span>
  );
}
