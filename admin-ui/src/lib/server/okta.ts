import 'server-only';
import { basePath, oktaConfig } from '@/lib/server/config';

export const OIDC_COOKIE = 'kwe_oidc';
export const OIDC_TTL_SECONDS = 600;

export interface OidcState {
  state: string;
  verifier: string;
  from: string;
}

const base64Url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url');
export const randomToken = () => base64Url(crypto.getRandomValues(new Uint8Array(32)));

export async function codeChallenge(verifier: string) {
  return base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
}

export const redirectUri = () => `${oktaConfig().publicUrl}${basePath()}/login/callback`;

export interface OktaTokens {
  access_token: string;
  id_token?: string;
  expires_in: number;
}

/** Authorization-code + PKCE exchange, done on the server so tokens never reach the browser. */
export async function exchangeCode(code: string, verifier: string): Promise<OktaTokens | null> {
  const okta = oktaConfig();
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
    client_id: okta.clientId,
  });
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' };
  if (okta.clientSecret) {
    const credentials = Buffer.from(`${okta.clientId}:${okta.clientSecret}`).toString('base64');
    headers.Authorization = `Basic ${credentials}`;
  }
  const res = await fetch(`${okta.issuer}/v1/token`, { method: 'POST', headers, body: form, cache: 'no-store' });
  return res.ok ? ((await res.json()) as OktaTokens) : null;
}

/** Email claim from the access token payload (signature is verified by the backend on /auth/me). */
export function emailFromToken(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as Record<string, unknown>;
    return String(payload.email ?? payload.sub ?? '').toLowerCase();
  } catch {
    return '';
  }
}
