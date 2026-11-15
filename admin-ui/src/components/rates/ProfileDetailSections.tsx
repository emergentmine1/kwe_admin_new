import { Tag } from 'lucide-react';
import { CALC_METHODS, CARRIERS, DEST_PORTS, ORIGIN_PORTS, TRANSPORT_MODES, calcMethod, nameOf } from '@/lib/rate-profiles/constants';
import { fmtStamp, pct } from '@/lib/rate-profiles/ui';
import type { RateProfile } from '@/lib/rate-profiles/types';
import { slug, tid } from '@/lib/utils';

const money = (v: number | undefined, cur: string) => {
  if (v === undefined || v === null) return '—';
  return cur === 'USD' ? `$${Number(v).toFixed(2)}` : `${Number(v).toFixed(2)} ${cur}`;
};

export function GeneralInfo({ p }: Readonly<{ p: RateProfile }>) {
  const items: [string, string][] = [
    ['Profile ID', p.profileCode],
    ['Charge Code', p.chargeCode],
    ['Carrier Code', `${p.carrierCode} - ${nameOf(CARRIERS, p.carrierCode)}`],
    ['Transport Mode', nameOf(TRANSPORT_MODES, p.transportMode)],
    ['Service Type', p.serviceType],
    ['Origin Port', `${p.originPort} - ${nameOf(ORIGIN_PORTS, p.originPort)}`],
    ['Calculation Method', nameOf(CALC_METHODS, p.calculationMethod)],
    ['Currency Code', p.currencyCode],
    ['Effective Date', p.effectiveDate],
    ['Expiration Date', p.expirationDate],
    ['External Markup', pct(p.externalMarkup)],
    ['Internal Markup', pct(p.internalMarkup)],
    ['Status', p.status],
    ['Version', `v${p.version}`],
    ['Created', `${fmtStamp(p.createdAt)} · ${p.createdBy ?? '—'}`],
    ['Last Modified', `${fmtStamp(p.updatedAt)} · ${p.updatedBy ?? '—'}`],
  ];
  return (
    <div className="space-y-4" {...tid('detail-general')}>
      <div className="rounded-xl bg-slate-50/70 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <Tag className="h-3.5 w-3.5" /> General info
        </div>
        <dl className="divide-y divide-slate-100">
          {items.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-600">{k}</dt>
              <dd {...tid(`general-${slug(k)}`)} className="break-words font-semibold text-kwe-ink sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      {p.remarks && (
        <div className="rounded-xl bg-slate-50/70 p-5">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Remarks</div>
          <p {...tid('detail-remarks')} className="text-sm text-slate-700">{p.remarks}</p>
        </div>
      )}
    </div>
  );
}

const TH = 'px-4 py-3 text-right whitespace-nowrap';
const TDN = 'px-4 py-3 text-right font-mono whitespace-nowrap';

export function WeightBreaksTable({ p }: Readonly<{ p: RateProfile }>) {
  const m = calcMethod(p.calculationMethod);
  return (
    <div className="overflow-x-auto scrollbar-thin" {...tid('detail-weight-breaks')}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            <th scope="col" className="sticky left-0 bg-slate-50 px-4 py-3 text-left">Destination</th>
            {m.flat && <th scope="col" className={TH}>Flat</th>}
            {m.weight && <th scope="col" className={TH}>Min</th>}
            {m.weight && <th scope="col" className={TH}>Max</th>}
            {m.weight && p.weightBreaks.map((w) => <th key={w} scope="col" className={TH}>{w} KG</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {p.rows.map((r) => (
            <tr key={r.destPort} {...tid(`detail-row-${r.destPort}`)}>
              <td className="sticky left-0 whitespace-nowrap bg-white px-4 py-3 font-bold text-kwe-ink">
                {r.destPort} <span className="text-xs font-normal text-slate-500">{nameOf(DEST_PORTS, r.destPort)}</span>
              </td>
              {m.flat && <td className={TDN}>{money(r.flatAmount, p.currencyCode)}</td>}
              {m.weight && <td className={TDN}>{money(r.minAmount, p.currencyCode)}</td>}
              {m.weight && <td className={TDN}>{money(r.maxAmount, p.currencyCode)}</td>}
              {m.weight && p.weightBreaks.map((w, c) => <td key={w} className={`${TDN} font-semibold`}>{money(r.rates[c], p.currencyCode)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
