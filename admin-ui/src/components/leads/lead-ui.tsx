import type { Lead, LeadStatus } from '@/lib/leads-store';

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-700 border-sky-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  qualified: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  proposal: 'bg-purple-100 text-purple-700 border-purple-200',
  won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  lost: 'bg-slate-100 text-slate-500 border-slate-200',
};

const CARGO_LABELS: Record<Lead['cargoMode'], string> = { fcl: 'FCL', lcl: 'LCL', air: 'Air' };
export const cargoLabel = (mode: Lead['cargoMode']) => CARGO_LABELS[mode];

/** ISO country code chip (replaces flag images). */
export function CountryCode({ code }: Readonly<{ code?: string }>) {
  if (!code) return null;
  return (
    <span className="inline-flex h-4 min-w-6 items-center justify-center rounded bg-slate-200 px-1 text-[9px] font-bold tracking-wider text-slate-700">
      {code}
    </span>
  );
}
