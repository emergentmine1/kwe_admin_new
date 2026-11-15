import 'server-only';
import type { AuthMode, DataSource } from '@/lib/auth/roles';

/** Drops trailing slashes without a regex (keeps URL joins predictable). */
export function trimSlash(url: string) {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') end--;
  return url.slice(0, end);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export function authMode(): AuthMode {
  const mode = required('AUTH_MODE').toLowerCase();
  if (mode === 'demo' || mode === 'static' || mode === 'okta') return mode;
  throw new Error('AUTH_MODE must be one of demo, static, okta');
}

/** demo keeps data in the browser; static and okta use the Java backend. */
export const dataSource = (): DataSource => (authMode() === 'demo' ? 'browser' : 'backend');

export const backendUrl = () => trimSlash(required('BACKEND_URL'));

export function sessionSecret(): string {
  const secret = required('SESSION_SECRET');
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  return secret;
}

export function oktaConfig() {
  return {
    issuer: trimSlash(required('OKTA_ISSUER')),
    clientId: required('OKTA_CLIENT_ID'),
    clientSecret: process.env.OKTA_CLIENT_SECRET || undefined,
    idpId: process.env.OKTA_IDP_ID || undefined,
    scopes: process.env.OKTA_SCOPES || 'openid profile email',
    publicUrl: trimSlash(required('APP_PUBLIC_URL')),
  };
}

export const basePath = () => process.env.NEXT_PUBLIC_BASE_PATH ?? '';
