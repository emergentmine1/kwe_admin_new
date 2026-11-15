import { AlarmClock, ArrowRight, Plane, Ship } from 'lucide-react';
import { Card, EmptyState } from '@/components/common/Blocks';
import { CountryCode, LEAD_STATUS_STYLES, cargoLabel } from '@/components/leads/lead-ui';
import { Badge } from '@/components/ui/badge';
import { ageHours, isOverdue, type Lead } from '@/lib/leads-store';
import { cn, initials, tid } from '@/lib/utils';

interface Props {
  leads: Lead[];
  selectedId: string | null;
  onSelect: (lead: Lead) => void;
}

export function LeadList({ leads, selectedId, onSelect }: Readonly<Props>) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <div {...tid('leads-count')} className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {leads.length} lead{leads.length === 1 ? '' : 's'}
        </div>
      </div>
      <div className="max-h-[640px] divide-y divide-slate-100 overflow-y-auto">
        {leads.length === 0 && <EmptyState id="leads-empty" title="No leads match these filters yet." />}
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} selected={selectedId === lead.id} onSelect={onSelect} />
        ))}
      </div>
    </Card>
  );
}

function LeadRow({ lead, selected, onSelect }: Readonly<{ lead: Lead; selected: boolean; onSelect: (l: Lead) => void }>) {
  const overdue = isOverdue(lead);
  const ModeIcon = lead.shippingMode === 'air' ? Plane : Ship;
  return (
    <button
      type="button"
      {...tid(`lead-row-${lead.id}`)}
      aria-pressed={selected}
      onClick={() => onSelect(lead)}
      className={cn(
        'relative flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:gap-4 sm:px-5',
        selected && 'bg-kwe-mist',
        overdue && !selected && 'bg-rose-50/40',
      )}
    >
      {overdue && <span className="absolute inset-y-0 left-0 w-[3px] bg-rose-500" />}
      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-kwe-navy to-kwe-blue text-sm font-black text-white sm:flex">
        {initials(lead.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-bold text-kwe-ink">{lead.name}</span>
          <Badge variant="outline" className={cn('text-[10px] uppercase tracking-widest',
            lead.userType === 'new' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600')}>
            {lead.userType === 'new' ? 'New' : 'Existing'}
          </Badge>
          {overdue && (
            <Badge variant="outline" {...tid(`overdue-badge-${lead.id}`)} className="inline-flex items-center gap-1 border-rose-200 bg-rose-100 text-[10px] uppercase tracking-widest text-rose-700">
              <AlarmClock className="h-3 w-3" /> Follow-up · {ageHours(lead)}h
            </Badge>
          )}
        </div>
        <div className="mt-0.5 truncate text-xs text-slate-500">
          {lead.company ? `${lead.company} · ` : ''}
          {lead.email}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <CountryCode code={lead.origin.countryCode} />
          <span className="font-mono">{lead.origin.code}</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <CountryCode code={lead.destination.countryCode} />
          <span className="font-mono">{lead.destination.code}</span>
          <span className="text-slate-300">·</span>
          <ModeIcon className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{cargoLabel(lead.cargoMode)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest', LEAD_STATUS_STYLES[lead.status])}>{lead.status}</span>
        <span className="text-[10px] text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
        <span className="hidden text-[10px] font-semibold text-slate-500 sm:inline">{lead.salesTeamName}</span>
      </div>
    </button>
  );
}
