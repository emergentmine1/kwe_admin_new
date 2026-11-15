import * as api from '@/lib/api-client';
import type { DataSource } from '@/lib/auth/roles';
import { CARRIERS, CATEGORIES, DEST_PORTS, ORIGIN_PORTS, SERVICE_TYPES } from '@/lib/rate-profiles/constants';
import { findActiveOverlap, overlapMessage } from '@/lib/rate-profiles/validation';
import type { Category, ProfileStatus, RateProfile, SaveProfileInput } from '@/lib/rate-profiles/types';

const KEY = 'kwe_rate_profiles_v1';
const DAY_MS = 86_400_000;

export class ProfileConflictError extends Error {}

const isoDate = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString().slice(0, 19);
const profileCode = (category: Category, id: number) => `${CATEGORIES[category].prefix}-${String(id).padStart(5, '0')}`;

function seedProfile(id: number, category: Category, i: number, chargeCode: string): RateProfile {
  const modified = new Date(Date.now() - i * 37 * 3_600_000).toISOString().slice(0, 19);
  const origin = category === 'origin';
  const flatOnly = origin && i % 2 === 1;
  const originRates = flatOnly ? [] : [0.15, 0.12];
  const originBreaks = flatOnly ? [] : ['>=45', '>=100'];
  return {
    id,
    profileCode: profileCode(category, id),
    category,
    chargeCode,
    carrierCode: CARRIERS[i % CARRIERS.length].code,
    transportMode: 'AIR',
    serviceType: SERVICE_TYPES[i % SERVICE_TYPES.length],
    originPort: ORIGIN_PORTS[i % 6].code,
    calculationMethod: flatOnly ? 'FLAT' : 'FLAT_WEIGHT',
    currencyCode: i % 5 === 4 ? 'EUR' : 'USD',
    effectiveDate: isoDate(-30 + i),
    expirationDate: isoDate(180 + i * 3),
    externalMarkup: 12,
    internalMarkup: 5,
    status: i % 4 === 3 ? 'DRAFT' : 'ACTIVE',
    remarks: '',
    version: 1 + (i % 4),
    createdBy: 'writer@kwe.com',
    createdAt: modified,
    updatedBy: 'writer@kwe.com',
    updatedAt: modified,
    weightBreaks: origin ? originBreaks : ['>=45', '>=100', '>=300'],
    rows: DEST_PORTS.slice(i % 8, (i % 8) + 3).map((d, k) => ({
      destPort: d.code,
      flatAmount: origin ? 35 + i * 5 : 0,
      minAmount: 20 + k * 5,
      rates: origin ? originRates : [3.1 - k * 0.2, 2.4 - k * 0.15, 1.85 - k * 0.1].map((r) => Number(r.toFixed(2))),
    })),
  };
}

function seed(): RateProfile[] {
  const out: RateProfile[] = [];
  let id = 1000;
  const freight = CATEGORIES.freight.chargeCodes.map((c) => c.code);
  for (let i = 0; i < 18; i++) out.push(seedProfile(id++, 'freight', i, freight[i % freight.length]));
  const origin = CATEGORIES.origin.chargeCodes.map((c) => c.code);
  for (let i = 0; i < 12; i++) out.push(seedProfile(id++, 'origin', i, origin[i % origin.length]));
  return out;
}

function readAll(): RateProfile[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (Array.isArray(value)) return value as RateProfile[];
  } catch {
    // corrupt storage — reseed below
  }
  const seeded = seed();
  writeAll(seeded);
  return seeded;
}

const writeAll = (list: RateProfile[]) => localStorage.setItem(KEY, JSON.stringify(list));
const byModifiedDesc = (a: RateProfile, b: RateProfile) => String(b.updatedAt).localeCompare(String(a.updatedAt));

function browserSave(profile: SaveProfileInput, userEmail: string): RateProfile {
  const all = readAll();
  const clash = findActiveOverlap(profile, all);
  if (clash) throw new ProfileConflictError(overlapMessage(clash));
  const now = nowIso();
  if (profile.id) {
    const current = all.find((p) => p.id === profile.id);
    if (!current) throw new Error('Profile no longer exists');
    if (current.version !== profile.version) {
      throw new ProfileConflictError('Someone else saved this profile first. Reload and try again.');
    }
    const next: RateProfile = { ...current, ...profile, id: current.id, version: current.version + 1, updatedBy: userEmail, updatedAt: now };
    writeAll(all.map((p) => (p.id === profile.id ? next : p)));
    return next;
  }
  const id = Math.max(999, ...all.map((p) => p.id)) + 1;
  const created: RateProfile = {
    ...profile,
    id,
    profileCode: profileCode(profile.category, id),
    version: 1,
    createdBy: userEmail,
    createdAt: now,
    updatedBy: userEmail,
    updatedAt: now,
  };
  writeAll([...all, created]);
  return created;
}

async function withConflict<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (e instanceof api.ApiError && e.status === 409) throw new ProfileConflictError(e.message);
    throw e;
  }
}

export interface ProfileStore {
  list(category: Category): Promise<RateProfile[]>;
  get(id: string | number): Promise<RateProfile | null>;
  save(profile: SaveProfileInput, userEmail: string): Promise<RateProfile>;
  remove(id: number): Promise<void>;
  changeStatus(profile: RateProfile, status: ProfileStatus, userEmail: string): Promise<RateProfile>;
}

const backendStore: ProfileStore = {
  list: async (category) => (await api.listRateProfiles(category)).items.sort(byModifiedDesc),
  get: (id) => api.getRateProfile(id),
  save: (profile) => withConflict(() => api.saveRateProfile(profile)),
  remove: async (id) => {
    await api.deleteRateProfile(id);
  },
  changeStatus: (profile, status) => withConflict(() => api.setRateProfileStatus(profile.id, status, profile.version)),
};

const browserStore: ProfileStore = {
  list: async (category) => readAll().filter((p) => p.category === category).sort(byModifiedDesc),
  get: async (id) => readAll().find((p) => String(p.id) === String(id)) ?? null,
  save: async (profile, userEmail) => browserSave(profile, userEmail),
  remove: async (id) => writeAll(readAll().filter((p) => p.id !== id)),
  changeStatus: async (profile, status, userEmail) => browserSave({ ...profile, status }, userEmail),
};

export const profileStore = (source: DataSource): ProfileStore => (source === 'backend' ? backendStore : browserStore);
