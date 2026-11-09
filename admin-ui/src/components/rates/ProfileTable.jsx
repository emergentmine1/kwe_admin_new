import { useMemo } from 'react';
import { Eye, Copy, PowerOff, Power, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusPill from '@/components/StatusPill';
import { CARRIERS, ORIGIN_PORTS, TRANSPORT_MODES, CALC_METHODS, nameOf } from '@/lib/rate-profiles/constants';

const COL_WIDTHS = {
  profile: 170,
  chargeCode: 150,
  carrier: 170,
  mode: 110,
  origin: 140,
  service: 120,
  currency: 100,
  effective: 120,
  expiry: 120,
  status: 100,
  lastModified: 140,
  version: 70,
  actions: 130,
};

export const fmtStamp = (s) => (s ? String(s).replace('T', ' ').slice(0, 16) : '—');
export const pct = (v) => (v === undefined || v === null || v === '' ? '—' : `${v}%`);

export const exportRows = (list) => list.map((p) => ({
  'Profile ID': p.profileCode,
  'Charge Code': p.chargeCode,
  Carrier: p.carrierCode,
  'Transport Mode': p.transportMode,
  'Service Type': p.serviceType,
  'Origin Port': p.originPort,
  'Calculation Method': nameOf(CALC_METHODS, p.calculationMethod),
  Currency: p.currencyCode,
  'Effective Date': p.effectiveDate,
  'Expiration Date': p.expirationDate,
  'External Markup %': p.externalMarkup ?? '',
  'Internal Markup %': p.internalMarkup ?? '',
  Status: p.status,
  Version: p.version,
  'Last Modified': fmtStamp(p.updatedAt),
  'Modified By': p.updatedBy,
  Destinations: (p.rows || []).map((r) => r.destPort).join(' '),
}));

const TH = ({ children, right = false, sticky = false, width, left = 0, className = '', onClick, active = false, dir = 'none' }) => (
  <th
    className={[
      right ? 'text-right' : 'text-left',
      'py-3 px-3 whitespace-nowrap align-middle border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-widest text-slate-500',
      sticky ? 'sticky z-20 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : '',
      onClick ? 'cursor-pointer select-none hover:bg-slate-100' : '',
      active ? 'text-[#0F172A]' : '',
      className,
    ].join(' ')}
    style={sticky ? { width, minWidth: width, left: `${left}px` } : { width, minWidth: width }}
    onClick={onClick}
  >
    <div className="flex items-center gap-1.5">
      <span>{children}</span>
      {onClick && (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] text-slate-400">
          {dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : dir === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3" />}
        </span>
      )}
    </div>
  </th>
);

export function ProfileTable({ list, sort, onSortChange, onView, onClone, onToggleStatus, onDelete }) {
  const stickySecondLeft = useMemo(() => COL_WIDTHS.profile, []);

  const handleSort = (key) => {
    if (!onSortChange) return;
    onSortChange((current) => {
      if (current?.key === key) {
        return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 kwe-shadow overflow-x-auto max-h-[75vh] relative">
      <table className="w-full border-separate border-spacing-0 min-w-[1200px]" style={{ tableLayout: 'fixed' }} data-testid="profile-table">
        <colgroup>
          <col style={{ width: `${COL_WIDTHS.profile}px` }} />
          <col style={{ width: `${COL_WIDTHS.chargeCode}px` }} />
          <col style={{ width: `${COL_WIDTHS.carrier}px` }} />
          <col style={{ width: `${COL_WIDTHS.mode}px` }} />
          <col style={{ width: `${COL_WIDTHS.origin}px` }} />
          <col style={{ width: `${COL_WIDTHS.service}px` }} />
          <col style={{ width: `${COL_WIDTHS.currency}px` }} />
          <col style={{ width: `${COL_WIDTHS.effective}px` }} />
          <col style={{ width: `${COL_WIDTHS.expiry}px` }} />
          <col style={{ width: `${COL_WIDTHS.status}px` }} />
          <col style={{ width: `${COL_WIDTHS.lastModified}px` }} />
          <col style={{ width: `${COL_WIDTHS.version}px` }} />
          <col style={{ width: `${COL_WIDTHS.actions}px` }} />
        </colgroup>

        <thead className="sticky top-0 z-30 bg-slate-50">
          <tr>
            <TH sticky left={0} width={COL_WIDTHS.profile} onClick={() => handleSort('profileCode')} active={sort?.key === 'profileCode'} dir={sort?.key === 'profileCode' ? sort.dir : 'none'}>Profile</TH>
            <TH sticky left={stickySecondLeft} width={COL_WIDTHS.chargeCode} onClick={() => handleSort('chargeCode')} active={sort?.key === 'chargeCode'} dir={sort?.key === 'chargeCode' ? sort.dir : 'none'}>Charge code</TH>
            <TH width={COL_WIDTHS.carrier} onClick={() => handleSort('carrierCode')} active={sort?.key === 'carrierCode'} dir={sort?.key === 'carrierCode' ? sort.dir : 'none'}>Carrier</TH>
            <TH width={COL_WIDTHS.mode} onClick={() => handleSort('transportMode')} active={sort?.key === 'transportMode'} dir={sort?.key === 'transportMode' ? sort.dir : 'none'}>Mode</TH>
            <TH width={COL_WIDTHS.origin} onClick={() => handleSort('originPort')} active={sort?.key === 'originPort'} dir={sort?.key === 'originPort' ? sort.dir : 'none'}>Origin</TH>
            <TH width={COL_WIDTHS.service} onClick={() => handleSort('serviceType')} active={sort?.key === 'serviceType'} dir={sort?.key === 'serviceType' ? sort.dir : 'none'}>Service</TH>
            <TH width={COL_WIDTHS.currency} onClick={() => handleSort('currencyCode')} active={sort?.key === 'currencyCode'} dir={sort?.key === 'currencyCode' ? sort.dir : 'none'}>Currency</TH>
            <TH width={COL_WIDTHS.effective} onClick={() => handleSort('effectiveDate')} active={sort?.key === 'effectiveDate'} dir={sort?.key === 'effectiveDate' ? sort.dir : 'none'}>Effective</TH>
            <TH width={COL_WIDTHS.expiry} onClick={() => handleSort('expirationDate')} active={sort?.key === 'expirationDate'} dir={sort?.key === 'expirationDate' ? sort.dir : 'none'}>Expiry</TH>
            <TH width={COL_WIDTHS.status} onClick={() => handleSort('status')} active={sort?.key === 'status'} dir={sort?.key === 'status' ? sort.dir : 'none'}>Status</TH>
            <TH width={COL_WIDTHS.lastModified} onClick={() => handleSort('updatedAt')} active={sort?.key === 'updatedAt'} dir={sort?.key === 'updatedAt' ? sort.dir : 'none'}>Last modified</TH>
            <TH right width={COL_WIDTHS.version} onClick={() => handleSort('version')} active={sort?.key === 'version'} dir={sort?.key === 'version' ? sort.dir : 'none'}>Ver.</TH>
            <TH width={COL_WIDTHS.actions} className="text-right" />
          </tr>
        </thead>

        <tbody className="text-sm divide-y divide-slate-100">
          {list.map((p) => (
            <tr key={p.id} data-testid={`profile-row-${p.profileCode}`} className="hover:bg-slate-50/60 transition-colors align-top">
              <td className="py-3 px-3 sticky left-0 z-10 bg-white border-b border-slate-100 align-top shadow-[1px_0_0_#e2e8f0]">
                <div className="min-w-0 max-w-full">
                  <button onClick={() => onView(p)} className="block w-full max-w-full text-left font-bold text-[#0F172A] hover:text-[#D4AF37] font-mono text-xs truncate" title={p.profileCode}>{p.profileCode}</button>
                  <div className="text-xs text-slate-500 mt-0.5 truncate" title={(p.rows || []).map((r) => r.destPort).slice(0, 4).join(', ') || '—'}>{(p.rows || []).map((r) => r.destPort).slice(0, 4).join(', ') || '—'}</div>
                </div>
              </td>
              <td className="py-3 px-3 font-mono text-xs font-bold text-slate-700 sticky z-10 bg-white border-b border-slate-100 align-top shadow-[1px_0_0_#e2e8f0]" style={{ left: `${stickySecondLeft}px` }} title={p.chargeCode}>
                <div className="truncate">{p.chargeCode}</div>
              </td>
              <td className="py-3 px-3 border-b border-slate-100 align-top">
                <div className="flex items-center gap-2 min-w-0 max-w-full">
                  <span className="font-mono text-xs font-bold text-[#0F172A] px-1.5 py-0.5 rounded bg-sky-50 whitespace-nowrap">{p.carrierCode}</span>
                  <span className="text-slate-700 text-xs truncate" title={nameOf(CARRIERS, p.carrierCode)}>{nameOf(CARRIERS, p.carrierCode)}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-xs text-slate-700 border-b border-slate-100 align-top truncate" title={nameOf(TRANSPORT_MODES, p.transportMode)}>{nameOf(TRANSPORT_MODES, p.transportMode)}</td>
              <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap border-b border-slate-100 align-top truncate" title={`${p.originPort} - ${nameOf(ORIGIN_PORTS, p.originPort)}`}>{p.originPort} - {nameOf(ORIGIN_PORTS, p.originPort)}</td>
              <td className="py-3 px-3 text-slate-700 border-b border-slate-100 align-top truncate" title={p.serviceType}>{p.serviceType}</td>
              <td className="py-3 px-3 font-mono text-xs text-slate-600 border-b border-slate-100 align-top truncate" title={p.currencyCode}>{p.currencyCode}</td>
              <td className="py-3 px-3 text-slate-600 whitespace-nowrap border-b border-slate-100 align-top truncate" title={p.effectiveDate}>{p.effectiveDate}</td>
              <td className="py-3 px-3 text-slate-600 whitespace-nowrap border-b border-slate-100 align-top truncate" title={p.expirationDate}>{p.expirationDate}</td>
              <td className="py-3 px-3 border-b border-slate-100 align-top"><StatusPill status={p.status} /></td>
              <td data-testid={`profile-modified-${p.profileCode}`} className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap border-b border-slate-100 align-top truncate" title={fmtStamp(p.updatedAt)}>{fmtStamp(p.updatedAt)}</td>
              <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 border-b border-slate-100 align-top truncate" title={`v${p.version}`}>v{p.version}</td>
              <td className="py-3 px-3 border-b border-slate-100 align-top">
                <div className="flex items-center gap-0.5 justify-end">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View" data-testid={`view-${p.profileCode}`} onClick={() => onView(p)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Clone" data-testid={`clone-${p.profileCode}`} onClick={() => onClone(p)}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${p.status === 'ACTIVE' ? 'text-amber-600' : 'text-emerald-600'}`}
                    title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} data-testid={`toggle-status-${p.profileCode}`} onClick={() => onToggleStatus(p)}>
                    {p.status === 'ACTIVE' ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" title="Delete" data-testid={`delete-${p.profileCode}`} onClick={() => onDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div data-testid="profile-empty" className="py-16 text-center text-sm text-slate-500">No rate profiles match your filters.</div>}
    </div>
  );
}
