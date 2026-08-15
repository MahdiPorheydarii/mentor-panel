import { cn } from '@/lib/utils';
import type { StudentStatus } from '@/lib/types';

const config: Record<StudentStatus, { label: string; className: string; dotColor: string }> = {
  active: {
    label: 'فعال',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  suspended: {
    label: 'معلق',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
  withdrawn: {
    label: 'انصراف',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dotColor: 'bg-slate-400',
  },
};

export function StatusBadge({ status }: { status: StudentStatus }) {
  const { label, className, dotColor } = config[status];
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
