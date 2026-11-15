'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { CATEGORIES } from '@/lib/rate-profiles/constants';
import { cn, isActiveTab } from '@/lib/rate-profiles/ui';

export function PricingTabs() {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <PageHeader
        id="pricing-title"
        title="Rate Management"
        subtitle="Rate Profiles for freight and origin charges. Single source of truth for freight cost calculation."
      />
      <nav aria-label="Rate categories" className="kwe-shadow overflow-x-auto rounded-xl border border-slate-100 bg-white px-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {Object.values(CATEGORIES).map((c) => {
            const active = isActiveTab(pathname, c.key);
            return (
              <Link
                key={c.key}
                href={`/admin/pricing/${c.key}`}
                id={`pricing-tab-${c.key}`}
                data-testid={`pricing-tab-${c.key}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap border-b-2 px-5 py-3.5 text-base font-bold transition-colors sm:px-8',
                  active ? 'border-kwe-gold text-kwe-ink' : 'border-transparent text-slate-500 hover:text-slate-700',
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
