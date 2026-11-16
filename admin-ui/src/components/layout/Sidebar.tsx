'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useSession } from '@/components/auth/SessionProvider';
import { BrandLogo } from '@/components/common/BrandLogo';
import { UserAvatar } from '@/components/common/UserAvatar';
import { isActivePath, navFor, type NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

interface Props {
  /** Prefix keeps locators unique between the desktop sidebar and the mobile drawer. */
  idPrefix: 'sidebar' | 'drawer';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ idPrefix, collapsed = false, onToggleCollapse, onNavigate }: Readonly<Props>) {
  const { user } = useSession();
  const pathname = usePathname();

  return (
    <aside
      id={idPrefix}
      data-testid={idPrefix}
      className={cn(
        'sticky top-0 flex h-dvh flex-col border-r border-slate-800/50 bg-kwe-ink text-slate-300 transition-[width] duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex h-16 items-center gap-2 border-b border-slate-800/60 px-3', collapsed && 'justify-center px-0')}>
        <div className="flex w-full items-center justify-center overflow-hidden">
          <BrandLogo id={`${idPrefix}-logo`} className={collapsed ? 'h-7' : 'h-9'} />
          {!collapsed && (
            <div className="ml-2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-slate-400">Rate &amp; Quote</div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            id={`${idPrefix}-collapse-toggle`}
            data-testid={`${idPrefix}-collapse-toggle`}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white lg:flex"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav aria-label="Administration" className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {!collapsed && <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Administration</div>}
        {navFor(user).map((item) => (
          <NavEntry key={item.code} item={item} depth={0} idPrefix={idPrefix} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      {!collapsed && (
        <div id={`${idPrefix}-user-card`} data-testid={`${idPrefix}-user-card`} className="m-3 rounded-xl border-t border-slate-800/60 bg-slate-800/40 p-3">
          <div className="flex items-center gap-3">
            <UserAvatar email={user.email} className="from-slate-600 to-slate-700" />
            <div className="min-w-0 flex-1">
              <div id={`${idPrefix}-user-email`} data-testid={`${idPrefix}-user-email`} className="truncate text-sm font-semibold text-white">
                {user.email}
              </div>
              <div id={`${idPrefix}-user-role`} data-testid={`${idPrefix}-user-role`} className="truncate text-[11px] text-slate-400">
                {user.name ?? `${user.permissions.length} permissions`}
              </div>
            </div>
          </div>
          <LogoutButton
            id={`${idPrefix}-logout-button`}
            label="Log out"
            variant="ghost"
            className="mt-3 h-8 w-full justify-start text-slate-300 hover:bg-slate-700/60 hover:text-white"
          />
        </div>
      )}
    </aside>
  );
}

interface EntryProps {
  item: NavItem;
  depth: number;
  idPrefix: string;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

/** One md_menus entry; children (parentmenucode) render indented underneath. */
function NavEntry({ item, depth, idPrefix, pathname, collapsed, onNavigate }: Readonly<EntryProps>) {
  const id = `${idPrefix}-nav-${item.code.toLowerCase()}`;
  const active = !!item.href && isActivePath(pathname, item.href);
  const body = (
    <>
      {active && <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-kwe-gold" />}
      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-kwe-gold' : 'text-slate-400')} />
      {!collapsed && <span>{item.label}</span>}
    </>
  );
  const cls = cn(
    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
    collapsed && 'justify-center px-2',
    depth > 0 && !collapsed && 'ml-4',
  );
  return (
    <>
      {item.href ? (
        <Link href={item.href} id={id} data-testid={id} title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined} onClick={onNavigate} className={cls}>
          {body}
        </Link>
      ) : (
        <div id={id} data-testid={id} className={cn(cls, 'cursor-default hover:bg-transparent')}>{body}</div>
      )}
      {item.children.map((child) => (
        <NavEntry key={child.code} item={child} depth={depth + 1} idPrefix={idPrefix} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </>
  );
}
