'use client';

import { Clock, List as ListIcon, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionProvider';
import { LoadingBlock } from '@/components/common/Blocks';
import { StatCard } from '@/components/common/StatCard';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { LeadFilters, EMPTY_LEAD_FILTERS, applyLeadFilters } from '@/components/leads/LeadFilters';
import { LeadList } from '@/components/leads/LeadList';
import { deleteLead, listLeads, updateLead, type Lead, type LeadStatus } from '@/lib/leads-store';
import { useHydrated } from '@/lib/use-hydrated';
import { tid } from '@/lib/utils';

const count = (leads: Lead[], status: LeadStatus) => leads.filter((l) => l.status === status).length;

export function LeadsView() {
  const { canWrite } = useSession();
  const hydrated = useHydrated();
  const [version, setVersion] = useState(0);
  const [filters, setFilters] = useState(EMPTY_LEAD_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  // Leads live in browser storage, so they load after hydration; `version` re-reads after edits.
  const leads = useMemo(() => (hydrated && version >= 0 ? listLeads() : null), [hydrated, version]);
  const refresh = () => setVersion((v) => v + 1);

  const all = useMemo(() => leads ?? [], [leads]);
  const filtered = useMemo(() => applyLeadFilters(all, filters), [all, filters]);
  const selected = all.find((l) => l.id === selectedId) ?? null;

  const select = (lead: Lead) => {
    setSelectedId(lead.id);
    if (globalThis.matchMedia?.('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };
  const changeStatus = (id: string, status: LeadStatus) => {
    if (!canWrite) return;
    updateLead(id, { status });
    refresh();
    toast.success(`Lead moved to ${status}`);
  };
  const remove = (id: string) => {
    if (!canWrite) return;
    deleteLead(id);
    refresh();
    setSelectedId(null);
    toast.success('Lead deleted');
  };

  return (
    <div className="space-y-6" {...tid('admin-leads-page')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-kwe-gold">
            <Sparkles className="h-3 w-3" /> Sales pipeline
          </div>
          <h1 {...tid('leads-title')} className="mt-1 text-2xl font-black tracking-tight text-kwe-ink sm:text-3xl">Customer Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Prospects captured from the Instant Quote flow. Assign, follow up and convert.</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <button type="button" {...tid('view-list')} aria-pressed="true"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-kwe-navy px-3 text-xs font-semibold text-white">
            <ListIcon className="h-3.5 w-3.5" /> List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard id="stat-total" label="Total leads" value={all.length} icon={Users} tone="navy" />
        <StatCard id="stat-new" label="New" value={count(all, 'new')} icon={Sparkles} tone="sky" />
        <StatCard id="stat-contacted" label="Contacted" value={count(all, 'contacted')} icon={Clock} tone="amber" />
        <StatCard id="stat-qualified" label="Qualified" value={count(all, 'qualified')} icon={TrendingUp} tone="indigo" />
        <StatCard id="stat-won" label="Won" value={count(all, 'won')} icon={TrendingUp} tone="emerald" />
      </div>

      <LeadFilters filters={filters} onChange={setFilters} />

      {leads === null ? (
        <LoadingBlock id="leads-loading" />
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_420px]">
          <LeadList leads={filtered} selectedId={selectedId} onSelect={select} />
          <LeadDetail ref={detailRef} lead={selected} canWrite={canWrite} onStatusChange={changeStatus} onDelete={remove} />
        </div>
      )}
    </div>
  );
}
