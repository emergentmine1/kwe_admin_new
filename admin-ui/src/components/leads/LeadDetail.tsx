'use client';

import { AlarmClock, ArrowRight, Boxes, Building2, Container, Mail, Phone, Trash2, Users, type LucideIcon } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { EmptyState, Eyebrow } from '@/components/common/Blocks';
import { FilterSelect } from '@/components/common/FilterSelect';
import { CountryCode } from '@/components/leads/lead-ui';
import { Button } from '@/components/ui/button';
import { LEAD_STATUSES, ageHours, isOverdue, type Lead, type LeadStatus } from '@/lib/leads-store';
import { initials, tid } from '@/lib/utils';

interface Props {
  ref?: Ref<HTMLElement>;
  lead: Lead | null;
  canWrite: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}

function DetailRow({ icon: Icon, label, children }: Readonly<{ icon: LucideIcon; label: string; children: ReactNode }>) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
        <div className="mt-0.5 min-w-0 text-sm text-kwe-ink">{children}</div>
      </div>
    </div>
  );
}

const Place = ({ p }: Readonly<{ p: Lead['origin'] }>) => (
  <span className="inline-flex items-center gap-1.5">
    <CountryCode code={p.countryCode} />
    <span className="font-semibold">{p.city}</span>
    <span className="font-mono text-xs text-slate-500">({p.code})</span>
  </span>
);

function Shipment({ lead }: Readonly<{ lead: Lead }>) {
  const fcl = lead.cargoMode === 'fcl';
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <Eyebrow className="mb-2">Shipment inquiry</Eyebrow>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Place p={lead.origin} />
        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        <Place p={lead.destination} />
      </div>
      {lead.commodity && (
        <div className="mt-2 flex items-start gap-2 text-xs text-slate-700">
          <Eyebrow className="mt-0.5 shrink-0">Commodity ·</Eyebrow>
          <span {...tid('lead-commodity')} className="font-semibold">{lead.commodity}</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          {fcl ? <Container className="h-3.5 w-3.5" /> : <Boxes className="h-3.5 w-3.5" />}
          <span className="font-semibold uppercase">{lead.cargoMode}</span>
        </span>
        <span className="font-semibold">
          {fcl && lead.containers.length > 0
            ? lead.containers.map((c) => `${c.count}× ${c.type}`).join(' · ')
            : `${lead.shipmentTotals.units} units · ${lead.shipmentTotals.cft.toFixed(1)} CFT`}
        </span>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Ready: <span className="font-semibold text-slate-700">{lead.readyDate}</span>
      </div>
    </div>
  );
}

export function LeadDetail({ ref, lead, canWrite, onStatusChange, onDelete }: Readonly<Props>) {
  return (
    <aside ref={ref} {...tid('lead-detail')} className="kwe-shadow h-fit scroll-mt-20 rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 lg:sticky lg:top-24">
      {lead ? (
        <div className="space-y-5">
          {isOverdue(lead) && (
            <div {...tid('overdue-banner')} className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <AlarmClock className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="text-xs text-rose-900">
                <div className="font-bold">Needs follow-up</div>
                <div className="mt-0.5">
                  This lead has been open for {ageHours(lead)}h without contact. Move to <span className="font-semibold">Contacted</span> or above once you&apos;ve reached out.
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-kwe-navy to-kwe-blue text-base font-black text-white">
              {initials(lead.name)}
            </div>
            <div className="min-w-0">
              <div {...tid('lead-detail-name')} className="truncate text-lg font-black text-kwe-ink">{lead.name}</div>
              <div className="font-mono text-xs text-slate-500">{lead.id}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <DetailRow icon={Mail} label="Email">
              <a href={`mailto:${lead.email}`} {...tid('lead-email-link')} className="break-all text-kwe-blue hover:underline">{lead.email}</a>
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              <a href={`tel:${lead.phone}`} {...tid('lead-phone-link')} className="text-kwe-ink">{lead.phone}</a>
            </DetailRow>
            {lead.company && <DetailRow icon={Building2} label="Company">{lead.company}</DetailRow>}
          </div>
          <Shipment lead={lead} />
          <div>
            <Eyebrow className="text-xs text-slate-600">Status</Eyebrow>
            <FilterSelect id="lead-status-select" label="Lead status" value={lead.status} disabled={!canWrite}
              onChange={(v) => onStatusChange(lead.id, v as LeadStatus)} options={LEAD_STATUSES.map((s) => [s, s])} className="mt-1.5 h-11 capitalize" />
          </div>
          <div>
            <Eyebrow className="text-xs text-slate-600">Sales team</Eyebrow>
            <div {...tid('lead-sales-team')} className="mt-1.5 flex h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-kwe-ink">
              {lead.salesTeamName}
            </div>
          </div>
          {lead.notes && <div {...tid('lead-notes')} className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900">{lead.notes}</div>}
          {canWrite && (
            <Button variant="outline" onClick={() => onDelete(lead.id)} {...tid('lead-delete-button')} name="lead-delete-button"
              className="h-10 w-full gap-1.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Delete lead
            </Button>
          )}
        </div>
      ) : (
        <EmptyState id="lead-detail-empty" icon={Users} title="Select a lead">Choose a lead from the list to see full details.</EmptyState>
      )}
    </aside>
  );
}
