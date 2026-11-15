import { NextResponse, type NextRequest } from 'next/server';
import { backendUrl, dataSource } from '@/lib/server/config';
import { isSameOrigin, jsonError } from '@/lib/server/request';
import { readSession } from '@/lib/server/session';

const ALLOWED_PATH = /^api\/v1\/[\w/-]+$/;

/** Backend-for-frontend: forwards same-origin calls to the Java API with the session's bearer token. */
async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (dataSource() !== 'backend') return jsonError(404, 'Backend API is not enabled in this mode.');
  if (request.method !== 'GET' && !isSameOrigin(request)) return jsonError(403, 'Cross-site request blocked.');
  const path = (await params).path.join('/');
  if (!ALLOWED_PATH.test(path)) return jsonError(404, 'Not found.');
  const token = (await readSession())?.accessToken;
  if (!token) return jsonError(401, 'Your session has expired. Please sign in again.');

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  try {
    const res = await fetch(`${backendUrl()}/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: hasBody ? await request.text() : undefined,
      cache: 'no-store',
    });
    return new NextResponse(res.status === 204 ? null : await res.text(), {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return jsonError(502, 'The backend service is unavailable. Please try again later.');
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
