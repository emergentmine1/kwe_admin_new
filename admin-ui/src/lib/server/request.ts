import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { basePath } from '@/lib/server/config';

/** Blocks cross-site state-changing requests (CSRF) on top of the SameSite=Lax cookie. */
export function isSameOrigin(request: NextRequest): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function publicOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  return `${proto}://${host}`;
}

export const redirectTo = (request: NextRequest, path: string) =>
  NextResponse.redirect(new URL(`${basePath()}${path}`, publicOrigin(request)), 303);

export const jsonError = (status: number, message: string) => NextResponse.json({ message }, { status });
