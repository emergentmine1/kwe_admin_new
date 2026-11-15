import type { NextRequest } from 'next/server';
import { landingFor } from '@/lib/nav';
import { authMode } from '@/lib/server/config';
import { OIDC_COOKIE, emailFromToken, exchangeCode, type OidcState } from '@/lib/server/okta';
import { redirectTo } from '@/lib/server/request';
import { SESSION_COOKIE, cookieOptions, resolveState, seal, unseal } from '@/lib/server/session';

const fail = (request: NextRequest, code: string) => {
  const response = redirectTo(request, `/login?error=${code}`);
  response.cookies.set(OIDC_COOKIE, '', cookieOptions(0));
  return response;
};

export async function GET(request: NextRequest) {
  if (authMode() !== 'okta') return redirectTo(request, '/login');
  const params = request.nextUrl.searchParams;
  const saved = await unseal<OidcState>(request.cookies.get(OIDC_COOKIE)?.value);
  const code = params.get('code');
  if (params.get('error') || !code || !saved || saved.state !== params.get('state')) return fail(request, 'sso');

  const tokens = await exchangeCode(code, saved.verifier).catch(() => null);
  if (!tokens) return fail(request, 'sso');

  const session = { email: emailFromToken(tokens.access_token), accessToken: tokens.access_token, idToken: tokens.id_token };
  const state = await resolveState(session);
  if (state.status === 'anonymous') return fail(request, 'sso');
  const target = state.status === 'authorized' ? landingFor(state.user.role, saved.from) : '/access-denied';

  const response = redirectTo(request, target);
  response.cookies.set(OIDC_COOKIE, '', cookieOptions(0));
  response.cookies.set(SESSION_COOKIE, await seal(session, tokens.expires_in), cookieOptions(tokens.expires_in));
  return response;
}
