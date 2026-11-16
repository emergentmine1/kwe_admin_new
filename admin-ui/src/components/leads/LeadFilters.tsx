'use client';

import { Filter, Search } from 'lucide-react';
import { Card } from '@/components/common/Blocks';
import { FilterSelect } from '@/components/common/FilterSelect';
import { Input } from '@/components/ui/input';
import { LEAD_STATUSES, SALES_TEAMS, type Lead } from '@/lib/leads-store';

export const EMPTY_LEAD_FILTERS = { q: '', status: 'all', team: 'all', type: 'all' };
export type LeadFilterState = typeof EMPTY_LEAD_FILTERS;

export function applyLeadFilters(leads: Lead[], f: LeadFilterState) {
  const q = f.q.toLowerCase();
  return leads.filter((l) => {
    if (f.status !== 'all' && l.status !== f.status) return false;
    if (f.team !== 'all' && l.salesTeamId !== f.team) return false;
    if (f.type !== 'all' && l.userType !== f.type) return false;
    if (!q) return true;
    return [l.name, l.email, l.company, l.origin.code, l.destination.code].some((v) => (v ?? '').toLowerCase().includes(q));
  });
}

export function LeadFilters({ filters, onChange }: Readonly<{ filters: LeadFilterState; onChange: (f: LeadFilterState) => void }>) {
  const set = (k: keyof LeadFilterState) => (v: string) => onChange({ ...filters, [k]: v });
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="relative min-w-0 flex-1 md:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="leads-search" className="sr-only">Search leads</label>
          <Input id="leads-search" name="leads-search" data-testid="leads-search" type="search"
            placeholder="Search by name, email, company or lane…" value={filters.q} onChange={(e) => set('q')(e.target.value)}
            className="h-10 rounded-xl border-slate-200 pl-9" />
        </div>
        <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:flex">
          <FilterSelect id="leads-filter-status" label="Status" value={filters.status} onChange={set('status')} all="All statuses"
            options={LEAD_STATUSES.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)])} className="md:w-40" />
          <FilterSelect id="leads-filter-team" label="Sales team" value={filters.team} onChange={set('team')} all="All sales teams"
            options={SALES_TEAMS.map((t) => [t.id, t.name])} className="md:w-52" />
          <FilterSelect id="leads-filter-type" label="Customer type" value={filters.type} onChange={set('type')} all="All types"
            options={[['new', 'New customers'], ['existing', 'Existing customers']]} className="md:w-44" />
        </div>
      </div>
    </Card>
  );
}
