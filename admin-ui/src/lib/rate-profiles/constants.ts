import { AIRLINES, AIR_DESTINATIONS, CURRENCIES, ORIGIN_AIRPORTS, SERVICE_TYPES } from '@/lib/reference-data';
import type { CalcMethodCode, Category, ProfileStatus } from '@/lib/rate-profiles/types';

export interface CodeName {
  code: string;
  name: string;
}

export interface CategoryMeta {
  key: Category;
  label: string;
  prefix: string;
  description: string;
  chargeCodes: CodeName[];
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  freight: {
    key: 'freight',
    label: 'Freight',
    prefix: 'RP-FRT',
    description: 'Freight charges · weight-break buy rates by destination',
    chargeCodes: [
      { code: 'FRTRV', name: 'Freight' },
      { code: 'FSCRV', name: 'Fuel Surcharge' },
      { code: 'SECFEERV', name: 'Security Fee' },
    ],
  },
  origin: {
    key: 'origin',
    label: 'Origin',
    prefix: 'RP-ORG',
    description: 'Local & other charges at origin',
    chargeCodes: [
      { code: 'CUSTCLRV', name: 'Customs Clearance' },
      { code: 'CARTAGERV', name: 'Cartage' },
      { code: 'PKPRV', name: 'Pickup' },
      { code: 'HANRV', name: 'Handling' },
      { code: 'IORV', name: 'Importer / Exporter of Record' },
      { code: 'CPRV', name: 'Customs Processing' },
    ],
  },
};

export const isCategory = (value: unknown): value is Category => value === 'freight' || value === 'origin';

export const categoryOfChargeCode = (code: string): Category | null =>
  Object.values(CATEGORIES).find((c) => c.chargeCodes.some((cc) => cc.code === code))?.key ?? null;

export const CARRIERS: CodeName[] = AIRLINES;
export const TRANSPORT_MODES: CodeName[] = [{ code: 'AIR', name: 'Air' }];
export const ORIGIN_PORTS: CodeName[] = ORIGIN_AIRPORTS;
export const DEST_PORTS: CodeName[] = AIR_DESTINATIONS;
export { CURRENCIES, SERVICE_TYPES };

export interface CalcMethod {
  code: CalcMethodCode;
  name: string;
  flat: boolean;
  weight: boolean;
}

export const CALC_METHODS: CalcMethod[] = [
  { code: 'FLAT', name: 'Flat Amount', flat: true, weight: false },
  { code: 'WEIGHT', name: 'Chargeable Wt X Rate Per Unit (KG)', flat: false, weight: true },
  { code: 'FLAT_WEIGHT', name: 'Flat Amount + Chargeable Wt X Rate Per Unit (KG)', flat: true, weight: true },
];

export const calcMethod = (code: string | undefined): CalcMethod =>
  CALC_METHODS.find((m) => m.code === code) ?? CALC_METHODS[0];

export const STATUSES: { code: ProfileStatus; name: string }[] = [
  { code: 'DRAFT', name: 'Draft' },
  { code: 'ACTIVE', name: 'Active' },
  { code: 'INACTIVE', name: 'Inactive' },
];

export const nameOf = (list: CodeName[], code: string | undefined) =>
  list.find((x) => x.code === code)?.name ?? code ?? '—';
