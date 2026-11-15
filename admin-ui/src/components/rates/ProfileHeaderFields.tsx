'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { Controller, type FieldError, type Path, type UseFormReturn } from 'react-hook-form';
import { FilterSelect } from '@/components/common/FilterSelect';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CALC_METHODS, CARRIERS, CATEGORIES, CURRENCIES, ORIGIN_PORTS, SERVICE_TYPES, STATUSES, TRANSPORT_MODES,
} from '@/lib/rate-profiles/constants';
import type { ProfileFormValues } from '@/lib/rate-profiles/form';
import type { ProfileFormOutput } from '@/lib/rate-profiles/validation';
import type { Category } from '@/lib/rate-profiles/types';

export type ProfileForm = UseFormReturn<ProfileFormValues, unknown, ProfileFormOutput>;

const BLOCKED_KEYS = new Set(['-', 'e', 'E', '+']);
export const blockNegative = {
  min: 0,
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
  },
};

const LABEL = 'text-xs font-semibold uppercase tracking-widest text-slate-600';

export function Section({ title, subtitle, children, id }: Readonly<{ title: string; subtitle?: string; children: ReactNode; id: string }>) {
  return (
    <section id={id} data-testid={id} className="kwe-shadow rounded-2xl border border-slate-100 bg-white p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="font-bold text-kwe-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const FieldErrorText = ({ error, id }: Readonly<{ error?: FieldError; id: string }>) =>
  error?.message ? (
    <p id={`${id}-error`} data-testid={`${id}-error`} className="mt-1 text-xs text-red-600">
      {error.message}
    </p>
  ) : null;

type Opt = [string, string][];

export function ProfileHeaderFields({ form, category }: Readonly<{ form: ProfileForm; category: Category }>) {
  const { control, register, formState: { errors } } = form;

  const select = (name: Path<ProfileFormValues>, label: string, options: Opt, id: string) => (
    <div>
      <Label htmlFor={id} className={LABEL}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FilterSelect id={id} label={label} value={String(field.value ?? '')} onChange={field.onChange} options={options} className="mt-1.5 h-11" />
        )}
      />
      <FieldErrorText error={errors[name as keyof typeof errors] as FieldError | undefined} id={id} />
    </div>
  );

  const input = (name: Path<ProfileFormValues>, label: string, id: string, props: Record<string, unknown>) => (
    <div>
      <Label htmlFor={id} className={LABEL}>{label}</Label>
      <Input id={id} data-testid={id} {...props} {...register(name)} className="mt-1.5 h-11 rounded-xl border-slate-200" />
      <FieldErrorText error={errors[name as keyof typeof errors] as FieldError | undefined} id={id} />
    </div>
  );

  return (
    <Section id="form-general-section" title="General Information"
      subtitle="Rate Profile header · one Active profile per Charge Code + Carrier + Mode + Service + Origin for any date">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {select('chargeCode', 'Charge Code', CATEGORIES[category].chargeCodes.map((c) => [c.code, `${c.code} · ${c.name}`]), 'form-charge-code')}
        {select('carrierCode', 'Carrier Code', CARRIERS.map((c) => [c.code, `${c.code} · ${c.name}`]), 'form-carrier')}
        {select('transportMode', 'Transport Mode', TRANSPORT_MODES.map((m) => [m.code, m.name]), 'form-transport-mode')}
        {select('serviceType', 'Service Type', SERVICE_TYPES.map((s) => [s, s]), 'form-service')}
        {select('originPort', 'Origin Port', ORIGIN_PORTS.map((p) => [p.code, `${p.code} · ${p.name}`]), 'form-origin')}
        {select('calculationMethod', 'Calculation Method', CALC_METHODS.map((m) => [m.code, m.name]), 'form-calculation-method')}
        {select('currencyCode', 'Currency Code', CURRENCIES.map((c) => [c, c]), 'form-currency')}
        {input('effectiveDate', 'Effective Date', 'form-effective', { type: 'date' })}
        {input('expirationDate', 'Expiration Date', 'form-expiry', { type: 'date' })}
        {input('externalMarkup', 'External Markup (%)', 'form-external-markup', { type: 'number', step: '0.01', max: 100, placeholder: 'e.g. 10', ...blockNegative })}
        {input('internalMarkup', 'Internal Markup (%)', 'form-internal-markup', { type: 'number', step: '0.01', max: 100, placeholder: 'e.g. 5', ...blockNegative })}
        {select('status', 'Status', STATUSES.map((s) => [s.code, s.name]), 'form-status')}
      </div>
      <div className="mt-4">
        <Label htmlFor="form-remarks" className={LABEL}>Remarks (optional)</Label>
        <Textarea id="form-remarks" data-testid="form-remarks" rows={2} {...register('remarks')} className="mt-1.5 rounded-xl border-slate-200" />
        <FieldErrorText error={errors.remarks} id="form-remarks" />
      </div>
    </Section>
  );
}
