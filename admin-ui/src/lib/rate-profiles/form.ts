import { CATEGORIES, calcMethod } from '@/lib/rate-profiles/constants';
import type { ProfileFormOutput } from '@/lib/rate-profiles/validation';
import type { Category, RateProfile, SaveProfileInput } from '@/lib/rate-profiles/types';

type Num = number | string | undefined;

export interface FormRow {
  destPort: string;
  flatAmount?: Num;
  minAmount?: Num;
  maxAmount?: Num;
  rates: Num[];
}

export interface ProfileFormValues {
  chargeCode: string;
  carrierCode: string;
  transportMode: string;
  serviceType: string;
  originPort: string;
  calculationMethod: string;
  currencyCode: string;
  effectiveDate: string;
  expirationDate: string;
  externalMarkup: Num;
  internalMarkup: Num;
  status: string;
  remarks: string;
  weightBreaks: { label: string }[];
  rows: FormRow[];
}

const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

export const blankRow = (breaks: number): FormRow => ({ destPort: '', flatAmount: 0, minAmount: '', maxAmount: '', rates: Array(breaks).fill(0) });

export const blankForm = (category: Category): ProfileFormValues => ({
  chargeCode: CATEGORIES[category].chargeCodes[0].code,
  carrierCode: '',
  transportMode: 'AIR',
  serviceType: 'STANDARD',
  originPort: '',
  calculationMethod: 'FLAT_WEIGHT',
  currencyCode: 'USD',
  effectiveDate: isoDay(),
  expirationDate: isoDay(365),
  externalMarkup: '',
  internalMarkup: '',
  status: 'DRAFT',
  remarks: '',
  weightBreaks: [{ label: '>=45' }, { label: '>=100' }, { label: '>=300' }],
  rows: [blankRow(3)],
});

export const profileToForm = (p: RateProfile): ProfileFormValues => ({
  chargeCode: p.chargeCode,
  carrierCode: p.carrierCode,
  transportMode: p.transportMode,
  serviceType: p.serviceType,
  originPort: p.originPort,
  calculationMethod: p.calculationMethod,
  currencyCode: p.currencyCode,
  effectiveDate: p.effectiveDate,
  expirationDate: p.expirationDate,
  externalMarkup: p.externalMarkup ?? '',
  internalMarkup: p.internalMarkup ?? '',
  status: p.status,
  remarks: p.remarks ?? '',
  weightBreaks: p.weightBreaks.map((label) => ({ label })),
  rows: p.rows.map((r) => ({ ...r, minAmount: r.minAmount ?? '', maxAmount: r.maxAmount ?? '', rates: [...r.rates] })),
});

export function formToProfile(d: ProfileFormOutput, category: Category, base: RateProfile | null): SaveProfileInput {
  const m = calcMethod(d.calculationMethod);
  return {
    ...(base ? { id: base.id, version: base.version } : {}),
    category,
    chargeCode: d.chargeCode,
    carrierCode: d.carrierCode,
    transportMode: d.transportMode,
    serviceType: d.serviceType,
    originPort: d.originPort,
    calculationMethod: d.calculationMethod,
    currencyCode: d.currencyCode,
    effectiveDate: d.effectiveDate,
    expirationDate: d.expirationDate,
    externalMarkup: d.externalMarkup,
    internalMarkup: d.internalMarkup,
    status: d.status,
    remarks: d.remarks ?? '',
    weightBreaks: m.weight ? d.weightBreaks.map((w) => w.label) : [],
    rows: d.rows.map((r) => ({
      destPort: r.destPort,
      flatAmount: m.flat ? r.flatAmount : undefined,
      minAmount: m.weight ? r.minAmount : undefined,
      maxAmount: m.weight ? r.maxAmount : undefined,
      rates: m.weight ? r.rates.map((x) => x ?? 0) : [],
    })),
  };
}

/** Flattens react-hook-form's nested errors into unique messages. */
export function collectErrors(err: unknown, out: string[] = []): string[] {
  if (!err || typeof err !== 'object') return out;
  const message = (err as { message?: unknown }).message;
  if (typeof message === 'string' && message) {
    out.push(message);
    return out;
  }
  for (const [k, v] of Object.entries(err)) if (k !== 'ref') collectErrors(v, out);
  return out;
}
