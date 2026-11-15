export type Role = 'READ_ONLY' | 'READ_WRITE';
export type AuthMode = 'demo' | 'static' | 'okta';
export type DataSource = 'browser' | 'backend';

export interface SessionUser {
  email: string;
  role: Role;
}

export type AuthState =
  | { status: 'authorized'; user: SessionUser }
  | { status: 'anonymous'; message?: string }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

export const VALID_ROLES: readonly Role[] = ['READ_ONLY', 'READ_WRITE'];
export const ANY_ROLE = VALID_ROLES;
export const WRITE_ROLE: readonly Role[] = ['READ_WRITE'];

export const ROLE_LABELS: Record<Role, string> = { READ_ONLY: 'Read-Only', READ_WRITE: 'Read + Write' };

export const NOT_AUTHORIZED_MESSAGE =
  'You are not authorized to access the KWE Instant Quote Admin application. Please contact your administrator.';
export const UNAVAILABLE_MESSAGE = 'The authorization service is unavailable. Please try again later.';
export const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

export const isRole = (value: unknown): value is Role => VALID_ROLES.includes(value as Role);
export const normaliseEmail = (email: unknown) => String(email ?? '').trim().toLowerCase();
/** Linear-time email shape check: one @, no spaces, a dot inside the domain. */
export function isEmail(value: string): boolean {
  const at = value.indexOf('@');
  if (at < 1 || at !== value.lastIndexOf('@') || /\s/.test(value)) return false;
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}
