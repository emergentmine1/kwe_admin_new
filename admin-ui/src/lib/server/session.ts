import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { EncryptJWT, jwtDecrypt } from 'jose';
import {
  EXPIRED_MESSAGE, UNAVAILABLE_MESSAGE, isSessionUser, type AuthState, type SessionUser,
} from '@/lib/auth/roles';
import { authMode, backendUrl, basePath, sessionSecret } from '@/lib/server/config';
import { resolveDemoUser } from '@/lib/server/demo-users';

export const SESSION_COOKIE = 'kwe_session';

export interface SessionData {
  email: string;
  accessToken?: string;
  idToken?: string;
}

async function key(): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sessionSecret()));
  return new Uint8Array(digest);
}

/** Encrypted (A256GCM) so tokens and emails are unreadable and tamper-proof in the browser. */
export async function seal(data: object, ttlSeconds: number): Promise<string> {
  return new EncryptJWT({ ...data })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .encrypt(await key());
}

export async function unseal<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, await key());
    return payload as T;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: basePath() || '/',
  maxAge,
});

async function fetchBackendRole(accessToken: string): Promise<AuthState> {
  try {
    const res = await fetch(`${backendUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (res.status === 401) return { status: 'anonymous', message: EXPIRED_MESSAGE };
    if (res.status === 403) return { status: 'denied' };
    if (!res.ok) return { status: 'unavailable', message: UNAVAILABLE_MESSAGE };
    const me: unknown = await res.json();
    if (!isSessionUser(me) || me.permissions.length === 0) return { status: 'denied' };
    return { status: 'authorized', user: { email: me.email, name: me.name ?? null, permissions: me.permissions, menus: me.menus } };
  } catch {
    return { status: 'unavailable', message: UNAVAILABLE_MESSAGE };
  }
}

/** Permissions are resolved from the trusted source on every request, never from the cookie. */
export async function resolveState(session: SessionData | null): Promise<AuthState> {
  if (!session?.email) return { status: 'anonymous' };
  if (authMode() === 'demo') {
    const user = resolveDemoUser(session.email);
    return user ? { status: 'authorized', user } : { status: 'denied' };
  }
  if (!session.accessToken) return { status: 'anonymous' };
  return fetchBackendRole(session.accessToken);
}

export const readSession = cache(async () => {
  const jar = await cookies();
  return unseal<SessionData>(jar.get(SESSION_COOKIE)?.value);
});

export const getAuthState = cache(async () => resolveState(await readSession()));

async function currentPath() {
  return (await headers()).get('x-kwe-path') ?? '/';
}

/** Redirects anonymous / denied users. Returns the user and whether they hold `permission`. */
export async function requireUser(permission?: string): Promise<{ user: SessionUser; permitted: boolean }> {
  const state = await getAuthState();
  if (state.status === 'denied' || state.status === 'unavailable') redirect('/access-denied');
  if (state.status !== 'authorized') redirect(`/login?from=${encodeURIComponent(await currentPath())}`);
  return { user: state.user, permitted: !permission || state.user.permissions.includes(permission) };
}
