import { DollarSign, FileText, Users, type LucideIcon } from 'lucide-react';
import { ANY_ROLE, WRITE_ROLE, type Role } from '@/lib/auth/roles';

export interface NavItem {
  href: string;
  label: string;
  short: string;
  key: string;
  icon: LucideIcon;
  roles: readonly Role[];
}

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/pricing', label: 'Pricing Matrix', short: 'Pricing', key: 'pricing', icon: DollarSign, roles: WRITE_ROLE },
  { href: '/admin/leads', label: 'Customer Leads', short: 'Leads', key: 'leads', icon: Users, roles: ANY_ROLE },
  { href: '/admin/quotes', label: 'Quotes', short: 'Quotes', key: 'quotes', icon: FileText, roles: ANY_ROLE },
];

export const navFor = (role?: Role) => ADMIN_NAV.filter((n) => role && n.roles.includes(role));
export const homeFor = (role?: Role) => navFor(role)[0]?.href ?? '/login';

const isSafeLocalPath = (path: string) => path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');

/** Post-login target: the requested page if the role allows it, otherwise the role's home. */
export function landingFor(role: Role, from?: string | null) {
  if (from && isSafeLocalPath(from) && navFor(role).some((n) => from.startsWith(n.href))) return from;
  return homeFor(role);
}

export const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
