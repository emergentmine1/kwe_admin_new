import 'server-only';
import { backendUrl, dataSource } from '@/lib/server/config';
import { readSession } from '@/lib/server/session';
import type { Category, RateProfile } from '@/lib/rate-profiles/types';

/** Server-side GET against the Java API with the signed-in user's token. Null when unavailable. */
async function backendGet<T>(path: string): Promise<T | null> {
  if (dataSource() !== 'backend') return null;
  const token = (await readSession())?.accessToken;
  if (!token) return null;
  try {
    const res = await fetch(`${backendUrl()}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function serverListProfiles(category: Category) {
  const body = await backendGet<{ items: RateProfile[] }>(`/api/v1/rate-profiles?category=${encodeURIComponent(category)}`);
  return body?.items ?? null;
}

export const serverGetProfile = (id: string) =>
  /^\d+$/.test(id) ? backendGet<RateProfile>(`/api/v1/rate-profiles/${id}`) : Promise.resolve(null);
