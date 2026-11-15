'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useWatch, type ControllerRenderProps, type FieldErrors } from 'react-hook-form';
import { FilterSelect } from '@/components/common/FilterSelect';
import { Section, blockNegative, type ProfileForm } from '@/components/rates/ProfileHeaderFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEST_PORTS, calcMethod } from '@/lib/rate-profiles/constants';
import { blankRow, type ProfileFormValues } from '@/lib/rate-profiles/form';
import { sanitizeWeightBreak } from '@/lib/rate-profiles/validation';
import { cn, tid } from '@/lib/utils';

const ALLOWED_KEYS = /^[0-9<>=]$/;
const NAV_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter']);
const CELL = 'h-10 rounded-lg border-slate-200';
// Destination column stays pinned while the weight breaks scroll sideways (mobile + desktop).
const PINNED = 'sticky left-0 z-10 bg-white';

// Weight-break header: blocks every key except 0-9 < > =, and strips anything pasted.
function WeightBreakInput({ field, index }: Readonly<{ field: ControllerRenderProps<ProfileFormValues, `weightBreaks.${number}.label`>; index: number }>) {
  return (
    <Input
      {...tid(`weight-break-${index}`)}
      name={field.name}
      aria-label={`Weight break ${index + 1}`}
      inputMode="numeric"
      value={field.value ?? ''}
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey || NAV_KEYS.has(e.key)) return;
        if (!ALLOWED_KEYS.test(e.key)) e.preventDefault();
      }}
      onChange={(e) => field.onChange(sanitizeWeightBreak(e.target.value))}
      onBlur={field.onBlur}
      placeholder=">=45"
      maxLength={8}
      className="h-10 w-full rounded-lg border-slate-200 pr-8 font-semibold"
    />
  );
}

function rowError(errors: FieldErrors<ProfileFormValues>, i: number) {
  const e = errors.rows?.[i];
  if (!e) return undefined;
  const rate = Array.isArray(e.rates) ? e.rates.find(Boolean)?.message : e.rates?.message;
  return e.destPort?.message ?? e.maxAmount?.message ?? e.minAmount?.message ?? e.flatAmount?.message ?? rate;
}

export function RateMatrixEditor({ form }: Readonly<{ form: ProfileForm }>) {
  const { control, register, getValues, setValue, formState: { errors } } = form;
  const breaks = useFieldArray({ control, name: 'weightBreaks' });
  const rows = useFieldArray({ control, name: 'rows' });
  const m = calcMethod(useWatch({ control, name: 'calculationMethod' }));
  const used = (useWatch({ control, name: 'rows' }) ?? []).map((r) => r.destPort);

  const setRates = (fn: (rates: ProfileFormValues['rows'][number]['rates']) => ProfileFormValues['rows'][number]['rates']) =>
    getValues('rows').forEach((r, i) => setValue(`rows.${i}.rates`, fn([...r.rates]), { shouldDirty: true }));
  const addBreak = () => {
    const last = getValues('weightBreaks').at(-1)?.label ?? '';
    const n = Number(last.replace(/\D/g, '')) || 0;
    breaks.append({ label: `>=${n ? n + 100 : 45}` });
    setRates((r) => [...r, 0]);
  };
  const removeBreak = (i: number) => {
    breaks.remove(i);
    setRates((r) => r.filter((_, c) => c !== i));
  };
  const matrixError = errors.weightBreaks?.message ?? errors.weightBreaks?.root?.message ?? errors.rows?.message ?? errors.rows?.root?.message;

  return (
    <Section id="form-matrix-section" title="Rate Matrix" subtitle="Horizontal axis is weight breaks and vertical axis is destination port">
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-thin sm:mx-0 sm:px-0">
        <table {...tid('rate-matrix-editor')} className={cn('w-full table-fixed text-sm', m.weight ? 'min-w-[980px]' : 'min-w-[520px]')}>
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <th scope="col" className={cn(PINNED, 'w-44 px-2 pb-2 text-left sm:w-48')}>Dest Port</th>
              {m.flat && <th scope="col" className="w-32 px-2 pb-2 text-left">Flat Amount</th>}
              {m.weight && <th scope="col" className="w-24 px-2 pb-2 text-left">Min.</th>}
              {m.weight && <th scope="col" className="w-24 px-2 pb-2 text-left">Max.</th>}
              {m.weight &&
                breaks.fields.map((f, c) => (
                  <th key={f.id} scope="col" className="w-[150px] px-2 pb-2 text-left">
                    <div className="relative">
                      <Controller control={control} name={`weightBreaks.${c}.label`} render={({ field }) => <WeightBreakInput field={field} index={c} />} />
                      <Button variant="ghost" size="icon" onClick={() => removeBreak(c)} aria-label={`Remove weight break ${c + 1}`}
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-red-500" {...tid(`remove-weight-break-${c}`)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              <th scope="col" className="w-12"><span className="sr-only">Remove row</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.fields.map((f, r) => (
              <tr key={f.id}>
                <td className={cn(PINNED, 'px-2 py-1')}>
                  <Controller
                    control={control}
                    name={`rows.${r}.destPort`}
                    render={({ field }) => (
                      <FilterSelect
                        id={`dest-port-${r}`}
                        label={`Destination port row ${r + 1}`}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={DEST_PORTS.filter((d) => d.code === field.value || !used.includes(d.code)).map((d) => [d.code, `${d.name} (${d.code})`])}
                        className={cn(CELL, errors.rows?.[r]?.destPort && 'border-red-400')}
                      />
                    )}
                  />
                </td>
                {m.flat && (
                  <td className="px-2 py-1">
                    <Input type="number" step="0.01" {...blockNegative} {...register(`rows.${r}.flatAmount`)} {...tid(`flat-amount-${r}`)} aria-label={`Flat amount row ${r + 1}`} className={CELL} />
                  </td>
                )}
                {m.weight && (
                  <td className="px-2 py-1">
                    <Input type="number" step="any" {...blockNegative} {...register(`rows.${r}.minAmount`)} {...tid(`row-min-${r}`)} aria-label={`Minimum row ${r + 1}`} className={CELL} />
                  </td>
                )}
                {m.weight && (
                  <td className="px-2 py-1">
                    <Input type="number" step="any" {...blockNegative} {...register(`rows.${r}.maxAmount`)} {...tid(`row-max-${r}`)} aria-label={`Maximum row ${r + 1}`}
                      className={cn(CELL, errors.rows?.[r]?.maxAmount && 'border-red-400')} />
                  </td>
                )}
                {m.weight &&
                  breaks.fields.map((b, c) => (
                    <td key={b.id} className="px-2 py-1">
                      <Input type="number" step="0.01" {...blockNegative} {...register(`rows.${r}.rates.${c}`)} {...tid(`rate-${r}-${c}`)}
                        aria-label={`Rate row ${r + 1} break ${c + 1}`} className={CELL} />
                    </td>
                  ))}
                <td className="px-2 py-1">
                  <Button variant="ghost" size="icon" disabled={rows.fields.length <= 1} onClick={() => rows.remove(r)} aria-label={`Remove row ${r + 1}`}
                    className="h-10 w-10 text-red-500" {...tid(`remove-dest-row-${r}`)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {m.weight && (
          <Button variant="outline" onClick={addBreak} className="gap-1.5 rounded-xl" {...tid('add-weight-break')} name="add-weight-break">
            <Plus className="h-4 w-4" /> Add Weight Break Column
          </Button>
        )}
        <Button variant="outline" onClick={() => rows.append(blankRow(breaks.fields.length))} disabled={rows.fields.length >= DEST_PORTS.length}
          className="gap-1.5 rounded-xl" {...tid('add-dest-row')} name="add-dest-row">
          <Plus className="h-4 w-4" /> Add Destination Row
        </Button>
      </div>
      {matrixError && <p {...tid('matrix-error')} className="mt-2 text-xs text-red-600">{matrixError}</p>}
      {rows.fields.map((f, r) => {
        const msg = rowError(errors, r);
        return msg ? <p key={f.id} {...tid(`row-error-${r}`)} className="mt-1 text-xs text-red-600">Row {r + 1}: {msg}</p> : null;
      })}
    </Section>
  );
}
