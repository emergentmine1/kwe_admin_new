import { CALC_METHODS, nameOf } from '@/lib/rate-profiles/constants';
import type { Category, RateProfile, SortState } from '@/lib/rate-profiles/types';

export { cn } from '@/lib/utils';

export const isActiveTab = (pathname: string, category: Category) => pathname.startsWith(`/admin/pricing/${category}`);

export const fmtStamp = (s?: string) => (s ? s.replace('T', ' ').slice(0, 16) : '—');
export const pct = (v?: number) => (v === undefined || v === null ? '—' : `${v}%`);
export const destinations = (p: RateProfile, max = 4) => p.rows.map((r) => r.destPort).slice(0, max).join(', ') || '—';

export const exportRows = (list: RateProfile[]) =>
  list.map((p) => ({
    'Profile ID': p.profileCode,
    'Charge Code': p.chargeCode,
    Carrier: p.carrierCode,
    'Transport Mode': p.transportMode,
    'Service Type': p.serviceType,
    'Origin Port': p.originPort,
    'Calculation Method': nameOf(CALC_METHODS, p.calculationMethod),
    Currency: p.currencyCode,
    'Effective Date': p.effectiveDate,
    'Expiration Date': p.expirationDate,
    'External Markup %': p.externalMarkup ?? '',
    'Internal Markup %': p.internalMarkup ?? '',
    Status: p.status,
    Version: p.version,
    'Last Modified': fmtStamp(p.updatedAt),
    'Modified By': p.updatedBy ?? '',
    Destinations: p.rows.map((r) => r.destPort).join(' '),
  }));

function compareValues(a: RateProfile, b: RateProfile, key: SortState['key']) {
  if (key === 'updatedAt') return new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
  if (key === 'version') return a.version - b.version;
  return String(a[key] ?? '').toLowerCase().localeCompare(String(b[key] ?? '').toLowerCase());
}

export const sortProfiles = (list: RateProfile[], sort: SortState) => {
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => compareValues(a, b, sort.key) * dir);
};

export const errorMessage = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);
