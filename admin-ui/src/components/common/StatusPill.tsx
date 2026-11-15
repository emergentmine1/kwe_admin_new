import { cn } from '@/lib/utils';

const VARIANTS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  inactive: 'bg-slate-100 text-slate-500 ring-slate-300',
};

export function StatusPill({ status, className, id }: Readonly<{ status: string; className?: string; id?: string }>) {
  const variant = VARIANTS[status.toLowerCase()] ?? 'bg-slate-100 text-slate-700 ring-slate-300';
  return (
    <span
      id={id}
      data-testid={id}
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset', variant, className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.toLowerCase()}
    </span>
  );
}
