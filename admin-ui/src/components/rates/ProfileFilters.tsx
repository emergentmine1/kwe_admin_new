'use client';

import { Search } from 'lucide-react';
import { FilterSelect } from '@/components/common/FilterSelect';
import { Input } from '@/components/ui/input';
import { CARRIERS, CATEGORIES, ORIGIN_PORTS, SERVICE_TYPES, STATUSES, nameOf } from '@/lib/rate-profiles/constants';
import type { Category, RateProfile } from '@/lib/rate-profiles/types';

export const EMPTY_PROFILE_FILTERS = {
  q: '',
  chargeCode: 'all',
  carrierCode: 'all',
  originPort: 'all',
  serviceType: 'all',
  status: 'all',
};
export type ProfileFilterState = typeof EMPTY_PROFILE_FILTERS;
type SelectKey = Exclude<keyof ProfileFilterState, 'q'>;
const SELECT_KEYS: SelectKey[] = ['chargeCode', 'carrierCode', 'originPort', 'serviceType', 'status'];

export function applyProfileFilters(list: RateProfile[], f: ProfileFilterState) {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (SELECT_KEYS.some((k) => f[k] !== 'all' && p[k] !== f[k])) return false;
    if (!q) return true;
    return [
      p.profileCode, p.chargeCode, p.carrierCode, nameOf(CARRIERS, p.carrierCode), p.originPort,
      nameOf(ORIGIN_PORTS, p.originPort), p.serviceType, p.currencyCode, p.transportMode, p.remarks,
      ...p.rows.map((r) => r.destPort),
    ].some((v) => String(v ?? '').toLowerCase().includes(q));
  });
}

interface Props {
  category: Category;
  filters: ProfileFilterState;
  onChange: (f: ProfileFilterState) => void;
  profiles: RateProfile[];
}

export function ProfileFilters({ category, filters, onChange, profiles }: Readonly<Props>) {
  const set = (k: SelectKey) => (v: string) => onChange({ ...filters, [k]: v });
  const used = (k: 'carrierCode' | 'originPort') => [...new Set(profiles.map((p) => p[k]))].sort((a, b) => a.localeCompare(b));
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <label htmlFor="profile-search" className="sr-only">Search profiles</label>
        <Input
          id="profile-search"
          name="profile-search"
          data-testid="profile-search"
          type="search"
          placeholder="Search ID, carrier, port…"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          className="h-10 rounded-xl border-slate-200 pl-10"
        />
      </div>
      <FilterSelect id="filter-charge-code" label="Charge code" value={filters.chargeCode} onChange={set('chargeCode')} all="All charge codes"
        options={CATEGORIES[category].chargeCodes.map((c) => [c.code, `${c.code} · ${c.name}`])} />
      <FilterSelect id="filter-carrier" label="Carrier" value={filters.carrierCode} onChange={set('carrierCode')} all="All carriers"
        options={used('carrierCode').map((c) => [c, `${c} · ${nameOf(CARRIERS, c)}`])} />
      <FilterSelect id="filter-origin" label="Origin" value={filters.originPort} onChange={set('originPort')} all="All origins"
        options={used('originPort').map((c) => [c, `${c} · ${nameOf(ORIGIN_PORTS, c)}`])} />
      <FilterSelect id="filter-service" label="Service type" value={filters.serviceType} onChange={set('serviceType')} all="All services"
        options={SERVICE_TYPES.map((s) => [s, s])} />
      <FilterSelect id="filter-status" label="Status" value={filters.status} onChange={set('status')} all="All status"
        options={STATUSES.map((s) => [s.code, s.name])} />
    </div>
  );
}
