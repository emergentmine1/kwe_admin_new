import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
}

export function PageHeader({ title, subtitle, eyebrow, action, className, id }: Readonly<Props>) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{eyebrow}</div>}
        <h1 id={id} data-testid={id} className="text-2xl font-black tracking-tight text-kwe-ink sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 md:text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
