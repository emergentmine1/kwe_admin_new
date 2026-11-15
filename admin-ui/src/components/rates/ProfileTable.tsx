'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Eye, Power, PowerOff, Trash2 } from 'lucide-react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { StatusPill } from '@/components/common/StatusPill';
import { Button } from '@/components/ui/button';
import { CARRIERS, ORIGIN_PORTS, TRANSPORT_MODES, nameOf } from '@/lib/rate-profiles/constants';
import { cn, destinations, fmtStamp } from '@/lib/rate-profiles/ui';
import type { RateProfile, SortState } from '@/lib/rate-profiles/types';
import { tid } from '@/lib/utils';

type SortKey = SortState['key'];

// Static Tailwind widths (no inline styles, CSP-safe). Profile + charge code columns stay pinned.
const COLUMNS: { key: SortKey | null; label: string; width: string; sticky?: string; right?: boolean }[] = [
  { key: 'profileCode', label: 'Profile', width: 'w-[170px] min-w-[170px]', sticky: 'left-0' },
  { key: 'chargeCode', label: 'Charge code', width: 'w-[150px] min-w-[150px]', sticky: 'left-[170px]' },
  { key: 'carrierCode', label: 'Carrier', width: 'w-[170px] min-w-[170px]' },
  { key: 'transportMode', label: 'Mode', width: 'w-[110px] min-w-[110px]' },
  { key: 'originPort', label: 'Origin', width: 'w-[140px] min-w-[140px]' },
  { key: 'serviceType', label: 'Service', width: 'w-[120px] min-w-[120px]' },
  { key: 'currencyCode', label: 'Currency', width: 'w-[100px] min-w-[100px]' },
  { key: 'effectiveDate', label: 'Effective', width: 'w-[120px] min-w-[120px]' },
  { key: 'expirationDate', label: 'Expiry', width: 'w-[120px] min-w-[120px]' },
  { key: 'status', label: 'Status', width: 'w-[100px] min-w-[100px]' },
  { key: 'updatedAt', label: 'Last modified', width: 'w-[140px] min-w-[140px]' },
  { key: 'version', label: 'Ver.', width: 'w-[70px] min-w-[70px]', right: true },
  { key: null, label: 'Actions', width: 'w-[130px] min-w-[130px]' },
];

const PIN = 'sticky z-10 bg-white shadow-[1px_0_0_#e2e8f0]';
const TD = 'border-b border-slate-100 px-3 py-3 align-top';

function SortIcon({ dir }: Readonly<{ dir: 'asc' | 'desc' | null }>) {
  if (dir === 'asc') return <ArrowUp className="h-3 w-3" />;
  if (dir === 'desc') return <ArrowDown className="h-3 w-3" />;
  return <ArrowUpDown className="h-3 w-3" />;
}

function ariaSort(sort: SortState, key: SortKey | null) {
  if (sort.key !== key) return undefined;
  return sort.dir === 'asc' ? 'ascending' : 'descending';
}

interface Props {
  list: RateProfile[];
  sort: SortState;
  onSortChange: Dispatch<SetStateAction<SortState>>;
  onView: (p: RateProfile) => void;
  onClone: (p: RateProfile) => void;
  onToggleStatus: (p: RateProfile) => void;
  onDelete: (p: RateProfile) => void;
}

export function ProfileTable({ list, sort, onSortChange, onView, onClone, onToggleStatus, onDelete }: Readonly<Props>) {
  const toggleSort = (key: SortKey) =>
    onSortChange((cur) => (cur.key === key ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div className="kwe-shadow relative max-h-[75vh] overflow-auto rounded-xl border border-slate-100 bg-white scrollbar-thin">
      <table {...tid('profile-table')} className="w-full min-w-[1660px] table-fixed border-separate border-spacing-0">
        <thead className="sticky top-0 z-30 bg-slate-50">
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c.label}
                scope="col"
                aria-sort={ariaSort(sort, c.key)}
                className={cn(
                  'whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 align-middle text-[11px] font-semibold uppercase tracking-widest text-slate-500',
                  c.width,
                  c.right ? 'text-right' : 'text-left',
                  c.sticky && `${c.sticky} sticky z-20 shadow-[1px_0_0_#e2e8f0]`,
                  sort.key === c.key && 'text-kwe-ink',
                )}
              >
                {c.key ? (
                  <button
                    type="button"
                    {...tid(`profile-sort-${c.key}`)}
                    onClick={() => toggleSort(c.key as SortKey)}
                    className={cn('inline-flex items-center gap-1.5 uppercase hover:text-kwe-ink', c.right && 'flex-row-reverse')}
                  >
                    {c.label}
                    <span className="text-slate-400">
                      <SortIcon dir={sort.key === c.key ? sort.dir : null} />
                    </span>
                  </button>
                ) : (
                  <span className="sr-only">{c.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {list.map((p) => (
            <ProfileRow key={p.id} p={p} onView={onView} onClone={onClone} onToggleStatus={onToggleStatus} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
      {list.length === 0 && (
        <div {...tid('profile-empty')} className="py-16 text-center text-sm text-slate-500">
          No rate profiles match your filters.
        </div>
      )}
    </div>
  );
}

function Cell({ children, className, title, id }: Readonly<{ children: ReactNode; className?: string; title?: string; id?: string }>) {
  return (
    <td id={id} data-testid={id} title={title} className={cn(TD, 'truncate text-slate-700', className)}>
      {children}
    </td>
  );
}

type RowProps = Omit<Props, 'list' | 'sort' | 'onSortChange'> & { p: RateProfile };

function ProfileRow({ p, onView, onClone, onToggleStatus, onDelete }: Readonly<RowProps>) {
  const code = p.profileCode;
  const active = p.status === 'ACTIVE';
  const carrier = nameOf(CARRIERS, p.carrierCode);
  return (
    <tr {...tid(`profile-row-${code}`)} className="align-top transition-colors hover:bg-slate-50/60">
      <td className={cn(TD, PIN, 'left-0')}>
        <button type="button" {...tid(`profile-link-${code}`)} onClick={() => onView(p)} title={code}
          className="block w-full truncate text-left font-mono text-xs font-bold text-kwe-ink hover:text-kwe-gold">
          {code}
        </button>
        <div className="mt-0.5 truncate text-xs text-slate-500" title={destinations(p)}>{destinations(p)}</div>
      </td>
      <td className={cn(TD, PIN, 'left-[170px] truncate font-mono text-xs font-bold text-slate-700')} title={p.chargeCode}>
        {p.chargeCode}
      </td>
      <td className={TD}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="whitespace-nowrap rounded bg-sky-50 px-1.5 py-0.5 font-mono text-xs font-bold text-kwe-ink">{p.carrierCode}</span>
          <span className="truncate text-xs text-slate-700" title={carrier}>{carrier}</span>
        </div>
      </td>
      <Cell className="text-xs">{nameOf(TRANSPORT_MODES, p.transportMode)}</Cell>
      <Cell className="text-xs" title={`${p.originPort} - ${nameOf(ORIGIN_PORTS, p.originPort)}`}>
        {p.originPort} - {nameOf(ORIGIN_PORTS, p.originPort)}
      </Cell>
      <Cell>{p.serviceType}</Cell>
      <Cell className="font-mono text-xs text-slate-600">{p.currencyCode}</Cell>
      <Cell className="text-slate-600">{p.effectiveDate}</Cell>
      <Cell className="text-slate-600">{p.expirationDate}</Cell>
      <td className={TD}><StatusPill status={p.status} id={`profile-status-${code}`} /></td>
      <Cell id={`profile-modified-${code}`} className="text-xs text-slate-600">{fmtStamp(p.updatedAt)}</Cell>
      <Cell className="text-right font-mono text-xs">v{p.version}</Cell>
      <td className={TD}>
        <div className="flex items-center justify-end gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View" aria-label={`View ${code}`} {...tid(`view-${code}`)} onClick={() => onView(p)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Clone" aria-label={`Clone ${code}`} {...tid(`clone-${code}`)} onClick={() => onClone(p)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn('h-8 w-8', active ? 'text-amber-600' : 'text-emerald-600')}
            title={active ? 'Deactivate' : 'Activate'} aria-label={`${active ? 'Deactivate' : 'Activate'} ${code}`}
            {...tid(`toggle-status-${code}`)} onClick={() => onToggleStatus(p)}>
            {active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" title="Delete" aria-label={`Delete ${code}`} {...tid(`delete-${code}`)} onClick={() => onDelete(p)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
