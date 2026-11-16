import { DollarSign, FileText, LayoutGrid, Users, type LucideIcon } from 'lucide-react';
import type { MenuEntry, SessionUser } from '@/lib/auth/roles';

export interface NavItem {
  code: string;
  label: string;
  href: string | null;
  icon: LucideIcon;
  children: NavItem[];
}

const ICONS: [string, LucideIcon][] = [
  ['/admin/pricing', DollarSign],
  ['/admin/leads', Users],
  ['/admin/quotes', FileText],
];
const iconFor = (path: string | null) => ICONS.find(([prefix]) => path?.startsWith(prefix))?.[1] ?? LayoutGrid;
const byOrder = (a: MenuEntry, b: MenuEntry) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);

/** md_menus tree (parentmenucode → code) for the signed-in user. */
export function navFor(user: Pick<SessionUser, 'menus'>): NavItem[] {
  const build = (parent: string | null): NavItem[] =>
    user.menus
      .filter((m) => m.parentCode === parent)
      .sort(byOrder)
      .map((m) => ({ code: m.code, label: m.name, href: m.routePath, icon: iconFor(m.routePath), children: build(m.code) }))
      .filter((n) => n.href || n.children.length);
  return build(null);
}

const firstHref = (items: NavItem[]): string | null => {
  for (const item of items) {
    const href = item.href ?? firstHref(item.children);
    if (href) return href;
  }
  return null;
};

/** Top-level entries with a usable link (mobile bottom bar). */
export const primaryNav = (user: Pick<SessionUser, 'menus'>) =>
  navFor(user)
    .map((n) => ({ ...n, href: n.href ?? firstHref(n.children) }))
    .filter((n): n is NavItem & { href: string } => !!n.href);

export const homeFor = (user: Pick<SessionUser, 'menus'>) => firstHref(navFor(user)) ?? '/access-denied';

const isSafeLocalPath = (path: string) => path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');

export const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Post-login target: the requested page if one of the user's menus covers it, otherwise their home. */
export function landingFor(user: Pick<SessionUser, 'menus'>, from?: string | null) {
  const path = from?.split('?')[0] ?? '';
  if (from && isSafeLocalPath(from) && user.menus.some((m) => m.routePath && isActivePath(path, m.routePath))) return from;
  return homeFor(user);
}
