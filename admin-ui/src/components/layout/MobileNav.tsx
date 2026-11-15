'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { isActivePath, navFor } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { user } = useSession();
  const pathname = usePathname();

  return (
    <nav
      id="mobile-nav"
      data-testid="mobile-nav"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {navFor(user.role).map((item) => {
        const active = isActivePath(pathname, item.href);
        const id = `mobile-nav-${item.key}`;
        return (
          <Link
            key={item.href}
            href={item.href}
            id={id}
            data-testid={id}
            aria-current={active ? 'page' : undefined}
            className={cn('flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors', active ? 'text-kwe-ink' : 'text-slate-500')}
          >
            <item.icon className={cn('h-5 w-5', active && 'text-kwe-gold')} />
            <span className="text-[10px] font-semibold tracking-wide">{item.short}</span>
            {active && <span className="h-0.5 w-6 rounded-full bg-kwe-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}
