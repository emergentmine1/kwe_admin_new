import { NextResponse, type NextRequest } from 'next/server';

/** Exposes the requested path to server components (used for post-login return). */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-kwe-path', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)'],
};
