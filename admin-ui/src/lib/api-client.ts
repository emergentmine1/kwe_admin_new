import { withBasePath } from '@/lib/utils';
import type { Category, RateProfile, SaveProfileInput } from '@/lib/rate-profiles/types';

export const UNAUTHORIZED_EVENT = 'kwe:unauthorized';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Goes through the Next.js server (/bff), which adds the user's token; the browser never sees it.
async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(withBasePath(`/bff/api/v1${path}`), {
    method: init.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401) globalThis.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as { detail?: string; title?: string; message?: string };
    throw new ApiError(problem.detail ?? problem.title ?? problem.message ?? `Request failed (${res.status})`, res.status);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const listRateProfiles = (category: Category) =>
  request<{ items: RateProfile[] }>(`/rate-profiles?category=${encodeURIComponent(category)}`);

export const getRateProfile = (id: string | number) => request<RateProfile>(`/rate-profiles/${id}`);

/** POST creates; PUT updates and must carry the loaded `version` (409 when stale or overlapping). */
export const saveRateProfile = ({ id, ...body }: SaveProfileInput) =>
  id
    ? request<RateProfile>(`/rate-profiles/${id}`, { method: 'PUT', body })
    : request<RateProfile>('/rate-profiles', { method: 'POST', body });

export const setRateProfileStatus = (id: number, status: string, version: number) =>
  request<RateProfile>(`/rate-profiles/${id}/status`, { method: 'PATCH', body: { status, version } });

export const deleteRateProfile = (id: number) => request<null>(`/rate-profiles/${id}`, { method: 'DELETE' });
