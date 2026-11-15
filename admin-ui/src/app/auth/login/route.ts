import { NextResponse, type NextRequest } from 'next/server';
import { isEmail, normaliseEmail } from '@/lib/auth/roles';
import { homeFor, landingFor } from '@/lib/nav';
import { authMode, backendUrl } from '@/lib/server/config';
import { DEMO_PASSWORD } from '@/lib/server/demo-users';
import { isSameOrigin, jsonError } from '@/lib/server/request';
import { SESSION_COOKIE, cookieOptions, resolveState, seal, type SessionData } from '@/lib/server/session';

const DEMO_TTL_SECONDS = 8 * 3600;
const INVALID = 'Invalid email or password.';

async function staticLogin(email: string, password: string): Promise<{ session: SessionData; ttl: number } | null> {
  const res = await fetch(`${backendUrl()}/api/v1/auth/static-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { accessToken: string; expiresIn: number };
  return { session: { email, accessToken: body.accessToken }, ttl: body.expiresIn };
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, 'Cross-site request blocked.');
  const mode = authMode();
  if (mode === 'okta') return jsonError(404, 'Password sign-in is disabled.');

  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown; from?: unknown };
  const email = normaliseEmail(body.email);
  const password = String(body.password ?? '');
  if (!isEmail(email) || !password) return jsonError(400, INVALID);

  let login: { session: SessionData; ttl: number } | null;
  if (mode === 'demo') {
    login = password === DEMO_PASSWORD ? { session: { email }, ttl: DEMO_TTL_SECONDS } : null;
  } else {
    try {
      login = await staticLogin(email, password);
    } catch {
      return jsonError(503, 'The authorization service is unavailable. Please try again later.');
    }
  }
  if (!login) return jsonError(401, INVALID);

  const state = await resolveState(login.session);
  const from = typeof body.from === 'string' ? body.from : null;
  const redirect = state.status === 'authorized' ? landingFor(state.user.role, from) : '/access-denied';
  const response = NextResponse.json({ redirect: redirect || homeFor() });
  response.cookies.set(SESSION_COOKIE, await seal(login.session, login.ttl), cookieOptions(login.ttl));
  return response;
}
