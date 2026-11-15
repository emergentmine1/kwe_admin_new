'use client';

import { Building2, Download, FileSpreadsheet, Filter, Plane, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionProvider';
import { Card, LoadingBlock } from '@/components/common/Blocks';
import { ConfirmProfileAction } from '@/components/rates/ConfirmProfileAction';
import { PricingTabs } from '@/components/rates/PricingTabs';
import { EMPTY_PROFILE_FILTERS, ProfileFilters, applyProfileFilters, type ProfileFilterState } from '@/components/rates/ProfileFilters';
import { ProfileTable } from '@/components/rates/ProfileTable';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { downloadCsv, downloadXlsx } from '@/lib/export';
import { CATEGORIES } from '@/lib/rate-profiles/constants';
import { useProfileStore } from '@/lib/rate-profiles/use-profile-store';
import { errorMessage, exportRows, sortProfiles } from '@/lib/rate-profiles/ui';
import type { Category, PendingAction, RateProfile, SortState } from '@/lib/rate-profiles/types';
import { tid } from '@/lib/utils';

interface Props {
  category: Category;
  /** Server-rendered rows (backend mode); null means load in the browser. */
  initialProfiles: RateProfile[] | null;
}

export function RateProfileList({ category, initialProfiles }: Readonly<Props>) {
  const meta = CATEGORIES[category];
  const router = useRouter();
  const { user } = useSession();
  const store = useProfileStore();
  const [all, setAll] = useState<RateProfile[]>(initialProfiles ?? []);
  const [loading, setLoading] = useState(initialProfiles === null);
  const [filters, setFilters] = useState<ProfileFilterState>(EMPTY_PROFILE_FILTERS);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'updatedAt', dir: 'desc' });

  useEffect(() => {
    if (initialProfiles !== null) return;
    let alive = true;
    store
      .list(category)
      .then((items) => alive && setAll(items))
      .catch((e: unknown) => toast.error(errorMessage(e, 'Could not load rate profiles')))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [category, initialProfiles, store]);

  const list = useMemo(() => sortProfiles(applyProfileFilters(all, filters), sort), [all, filters, sort]);
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_PROFILE_FILTERS);

  const toggleStatus = async (p: RateProfile) => {
    const next = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const saved = await store.changeStatus(p, next, user.email);
      setAll((cur) => [saved, ...cur.filter((x) => x.id !== saved.id)]);
      toast.success(`${p.profileCode} ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (e) {
      toast.error(errorMessage(e, 'Status change failed'), { duration: 8000 });
    }
  };

  const runAction = async ({ action, profile }: PendingAction) => {
    if (action === 'delete') {
      try {
        await store.remove(profile.id);
        setAll((cur) => cur.filter((x) => x.id !== profile.id));
        toast.success(`${profile.profileCode} deleted`);
      } catch (e) {
        toast.error(errorMessage(e, 'Delete failed'));
      }
    } else {
      await toggleStatus(profile);
    }
    setPending(null);
  };

  const fileName = `kwe-rate-profiles-${category}`;
  const exportXlsx = async () => {
    await downloadXlsx(fileName, exportRows(list), meta.label);
    toast.success(`${list.length} profiles exported`);
  };
  const exportCsv = () => {
    downloadCsv(fileName, exportRows(list));
    toast.success(`${list.length} profiles exported`);
  };
  const Icon = category === 'freight' ? Plane : Building2;

  return (
    <div className="space-y-5" {...tid(`rate-profile-list-${category}`)}>
      <PricingTabs />
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-kwe-ink">{meta.label} Rate Profiles</h2>
              <p {...tid('profile-count')} className="text-xs text-slate-500">
                {list.length} of {all.length} profiles · {meta.description} · sorted by {sort.key}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled title="Import from file — coming soon" className="h-10 gap-1.5 rounded-xl" {...tid('profile-import')} name="profile-import">
              <Upload className="h-4 w-4" /> Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!list.length} className="h-10 gap-1.5 rounded-xl" {...tid('profile-export')} name="profile-export">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem {...tid('profile-export-xlsx')} onSelect={() => void exportXlsx()}>
                  <FileSpreadsheet className="text-emerald-600" /> Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem {...tid('profile-export-csv')} onSelect={exportCsv}>
                  <Download /> Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild className="h-10 gap-1.5 rounded-xl bg-kwe-ink text-white hover:bg-slate-800">
              <Link href={`/admin/pricing/${category}/new`} {...tid('profile-new')}>
                <Plus className="h-4 w-4" /> New Matrix
              </Link>
            </Button>
          </div>
        </div>
        <ProfileFilters category={category} filters={filters} onChange={setFilters} profiles={all} />
        {filtersActive && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_PROFILE_FILTERS)}
            {...tid('profile-reset-filters')}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-kwe-gold"
          >
            <Filter className="h-3 w-3" /> Reset filters
          </button>
        )}
      </Card>

      {loading ? (
        <LoadingBlock id="profile-list-loading" />
      ) : (
        <ProfileTable
          list={list}
          sort={sort}
          onSortChange={setSort}
          onView={(p) => router.push(`/admin/pricing/profile/${p.id}`)}
          onClone={(p) => router.push(`/admin/pricing/${category}/new?cloneFrom=${p.id}`)}
          onToggleStatus={(p) => (p.status === 'ACTIVE' ? setPending({ action: 'deactivate', profile: p }) : void toggleStatus(p))}
          onDelete={(p) => setPending({ action: 'delete', profile: p })}
        />
      )}
      <ConfirmProfileAction pending={pending} onCancel={() => setPending(null)} onConfirm={runAction} />
    </div>
  );
}
