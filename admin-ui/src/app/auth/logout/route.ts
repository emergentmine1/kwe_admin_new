import { NextResponse, type NextRequest } from 'next/server';
import { authMode, basePath, oktaConfig } from '@/lib/server/config';
import { isSameOrigin, jsonError } from '@/lib/server/request';
import { SESSION_COOKIE, cookieOptions, readSession } from '@/lib/server/session';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, 'Cross-site request blocked.');
  let redirect = `${basePath()}/login`;
  if (authMode() === 'okta') {
    const okta = oktaConfig();
    const idToken = (await readSession())?.idToken;
    const params = new URLSearchParams({ post_logout_redirect_uri: `${okta.publicUrl}${basePath()}/login` });
    if (idToken) params.set('id_token_hint', idToken);
    redirect = `${okta.issuer}/v1/logout?${params}`;
  }
  const response = NextResponse.json({ redirect });
  response.cookies.set(SESSION_COOKIE, '', cookieOptions(0));
  return response;
}
