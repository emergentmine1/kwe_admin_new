import 'server-only';
import { isRole, type SessionUser } from '@/lib/auth/roles';

// Browser-free dummy accounts (mirrors backend-java/db/900_seed_dummy_admin_users.sql). Never for production.
export const DEMO_PASSWORD = 'Demo@123';

const DEMO_REGISTRY: Record<string, { role: string; active: boolean }> = {
  'read-user@kwe.com': { role: 'READ_ONLY', active: true },
  'write-user@kwe.com': { role: 'READ_WRITE', active: true },
  'inactive@kwe.com': { role: 'READ_WRITE', active: false },
  'odd@kwe.com': { role: 'SUPER_ADMIN', active: true },
};

export const DEMO_ACCOUNTS = [
  { email: 'write-user@kwe.com', note: 'Read + Write' },
  { email: 'read-user@kwe.com', note: 'Read-Only' },
  { email: 'inactive@kwe.com', note: 'Inactive → denied' },
  { email: 'outsider@kwe.com', note: 'No record → denied' },
];

/** The demo user's role, or null when the account is unknown, inactive or has an invalid role. */
export function resolveDemoUser(email: string): SessionUser | null {
  const row = DEMO_REGISTRY[email];
  if (!row?.active || !isRole(row.role)) return null;
  return { email, role: row.role };
}
