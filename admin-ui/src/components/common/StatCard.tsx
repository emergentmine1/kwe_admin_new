import type { LucideIcon } from 'lucide-react';
import { cn, tid } from '@/lib/utils';

const TONES = {
  navy: 'from-kwe-navy to-kwe-blue',
  sky: 'from-sky-500 to-sky-600',
  amber: 'from-amber-500 to-amber-600',
  indigo: 'from-indigo-500 to-indigo-600',
  emerald: 'from-emerald-500 to-emerald-600',
};

interface Props {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: keyof typeof TONES;
}

export function StatCard({ id, label, value, icon: Icon, tone }: Readonly<Props>) {
  return (
    <div {...tid(id)} className="kwe-shadow flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 sm:p-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', TONES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div {...tid(`${id}-value`)} className="text-xl font-black tracking-tight text-kwe-ink sm:text-2xl">{value}</div>
        <div className="truncate text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      </div>
    </div>
  );
}
