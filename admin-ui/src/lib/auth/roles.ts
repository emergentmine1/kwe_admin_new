export type AuthMode = 'demo' | 'static' | 'okta';
export type DataSource = 'browser' | 'backend';

/** One md_menus row the user may see (already filtered by pf_menupermissions on the server). */
export interface MenuEntry {
  code: string;
  name: string;
  parentCode: string | null;
  routePath: string | null;
  displayOrder: number;
}

export interface SessionUser {
  email: string;
  name: string | null;
  permissions: string[];
  menus: MenuEntry[];
}

export type AuthState =
  | { status: 'authorized'; user: SessionUser }
  | { status: 'anonymous'; message?: string }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

export const NOT_AUTHORIZED_MESSAGE =
  'You are not authorized to access the KWE Instant Quote Admin application. Please contact your administrator.';
export const UNAVAILABLE_MESSAGE = 'The authorization service is unavailable. Please try again later.';
export const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

export const normaliseEmail = (email: unknown) => String(email ?? '').trim().toLowerCase();

/** Linear-time email shape check: one @, no spaces, a dot inside the domain. */
export function isEmail(value: string): boolean {
  const at = value.indexOf('@');
  if (at < 1 || at !== value.lastIndexOf('@') || /\s/.test(value)) return false;
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

export const hasPermission = (user: Pick<SessionUser, 'permissions'>, code: string) => user.permissions.includes(code);

export function isSessionUser(value: unknown): value is SessionUser {
  const v = value as SessionUser;
  return !!v && typeof v.email === 'string' && Array.isArray(v.permissions) && Array.isArray(v.menus);
}
