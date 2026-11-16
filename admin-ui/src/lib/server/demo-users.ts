import 'server-only';
import type { MenuEntry, SessionUser } from '@/lib/auth/roles';
import { PERMISSIONS as P } from '@/lib/auth/permissions';

// Browser-free dummy accounts for AUTH_MODE=demo (mirrors backend-java/db/900_seed_dummy_rbac.sql). Never production.
export const DEMO_PASSWORD = 'Demo@123';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  RATE_ADMIN: [P.RATE_VIEW, P.RATE_CREATE, P.RATE_EDIT, P.RATE_DELETE, P.LEAD_VIEW, P.LEAD_EDIT, P.LEAD_DELETE, P.QUOTE_VIEW],
  SALES_VIEWER: [P.LEAD_VIEW, P.QUOTE_VIEW],
};

const USERS: Record<string, { name: string; active: boolean; roles: string[] }> = {
  'write-user@kwe.com': { name: 'Write User', active: true, roles: ['RATE_ADMIN'] },
  'read-user@kwe.com': { name: 'Read User', active: true, roles: ['SALES_VIEWER'] },
  'inactive@kwe.com': { name: 'Inactive User', active: false, roles: ['RATE_ADMIN'] },
  'norole@kwe.com': { name: 'No Role', active: true, roles: [] },
};

// md_menus + pf_menupermissions
const MENUS: (MenuEntry & { permissions: string[] })[] = [
  { code: 'PRICING', name: 'Pricing Matrix', parentCode: null, routePath: '/admin/pricing', displayOrder: 10, permissions: [P.RATE_VIEW] },
  { code: 'LEADS', name: 'Customer Leads', parentCode: null, routePath: '/admin/leads', displayOrder: 20, permissions: [P.LEAD_VIEW] },
  { code: 'QUOTES', name: 'Quotes', parentCode: null, routePath: '/admin/quotes', displayOrder: 30, permissions: [P.QUOTE_VIEW] },
];

export const DEMO_ACCOUNTS = [
  { email: 'write-user@kwe.com', note: 'Rate admin' },
  { email: 'read-user@kwe.com', note: 'Sales viewer' },
  { email: 'inactive@kwe.com', note: 'Inactive → denied' },
  { email: 'outsider@kwe.com', note: 'No record → denied' },
];

/** Effective permissions through active roles; null when unknown, inactive or without any permission. */
export function resolveDemoUser(email: string): SessionUser | null {
  const row = USERS[email];
  if (!row?.active) return null;
  const permissions = [...new Set(row.roles.flatMap((r) => ROLE_PERMISSIONS[r] ?? []))];
  if (!permissions.length) return null;
  const menus = MENUS.filter((m) => m.permissions.some((p) => permissions.includes(p))).map(
    (m): MenuEntry => ({ code: m.code, name: m.name, parentCode: m.parentCode, routePath: m.routePath, displayOrder: m.displayOrder }),
  );
  return { email, name: row.name, permissions, menus };
}
