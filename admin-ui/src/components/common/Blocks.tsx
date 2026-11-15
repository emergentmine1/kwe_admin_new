import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function LoadingBlock({ id, className }: Readonly<{ id: string; className?: string }>) {
  return (
    <div id={id} data-testid={id} role="status" className={cn('flex items-center justify-center py-16 text-slate-400', className)}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function EmptyState({ id, icon: Icon, title, children }: Readonly<{ id: string; icon?: LucideIcon; title: string; children?: ReactNode }>) {
  return (
    <div id={id} data-testid={id} className="px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-slate-300" />}
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      {children && <div className="mt-1 text-xs text-slate-400">{children}</div>}
    </div>
  );
}

export function Card({ className, children, id }: Readonly<{ className?: string; children: ReactNode; id?: string }>) {
  return (
    <section id={id} data-testid={id} className={cn('kwe-shadow rounded-2xl border border-slate-100 bg-white', className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn('text-[10px] font-bold uppercase tracking-widest text-slate-500', className)}>{children}</div>;
}
