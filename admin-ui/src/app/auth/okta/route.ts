import { NextResponse, type NextRequest } from 'next/server';
import { authMode, oktaConfig } from '@/lib/server/config';
import { OIDC_COOKIE, OIDC_TTL_SECONDS, codeChallenge, randomToken, redirectUri } from '@/lib/server/okta';
import { redirectTo } from '@/lib/server/request';
import { cookieOptions, seal } from '@/lib/server/session';

export async function GET(request: NextRequest) {
  if (authMode() !== 'okta') return redirectTo(request, '/login/sso');
  const okta = oktaConfig();
  const state = randomToken();
  const verifier = randomToken();
  const params = new URLSearchParams({
    client_id: okta.clientId,
    response_type: 'code',
    scope: okta.scopes,
    redirect_uri: redirectUri(),
    state,
    code_challenge: await codeChallenge(verifier),
    code_challenge_method: 'S256',
  });
  if (okta.idpId) params.set('idp', okta.idpId);
  const from = request.nextUrl.searchParams.get('from') ?? '';
  const response = NextResponse.redirect(`${okta.issuer}/v1/authorize?${params}`, 303);
  response.cookies.set(OIDC_COOKIE, await seal({ state, verifier, from }, OIDC_TTL_SECONDS), cookieOptions(OIDC_TTL_SECONDS));
  return response;
}
