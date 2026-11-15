'use client';

import { ArrowLeft, Copy, FileText, Layers, Pencil, Plane, Power, PowerOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionProvider';
import { Card, LoadingBlock } from '@/components/common/Blocks';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { ConfirmProfileAction } from '@/components/rates/ConfirmProfileAction';
import { GeneralInfo, WeightBreaksTable } from '@/components/rates/ProfileDetailSections';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CARRIERS, CATEGORIES, ORIGIN_PORTS, nameOf } from '@/lib/rate-profiles/constants';
import { errorMessage, fmtStamp } from '@/lib/rate-profiles/ui';
import { useProfileStore } from '@/lib/rate-profiles/use-profile-store';
import type { PendingAction, RateProfile } from '@/lib/rate-profiles/types';
import { cn, tid } from '@/lib/utils';

const TAB = 'gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-kwe-gold data-[state=active]:shadow-none';

export function RateProfileDetail({ id, initialProfile }: Readonly<{ id: string; initialProfile: RateProfile | null }>) {
  const router = useRouter();
  const { user } = useSession();
  const store = useProfileStore();
  const [p, setP] = useState<RateProfile | null | undefined>(initialProfile ?? undefined);
  const [pending, setPending] = useState<PendingAction | null>(null);

  useEffect(() => {
    if (initialProfile) return;
    store.get(id).then(setP, () => setP(null));
  }, [id, initialProfile, store]);

  if (p === undefined) return <LoadingBlock id="profile-detail-loading" className="py-24" />;
  if (!p) return <div {...tid('profile-not-found')} className="py-24 text-center text-slate-500">Rate profile not found.</div>;

  const meta = CATEGORIES[p.category];
  const title = `${p.carrierCode} · ${p.originPort} · ${p.chargeCode}`;
  const active = p.status === 'ACTIVE';

  const toggle = async () => {
    const next = active ? 'INACTIVE' : 'ACTIVE';
    try {
      setP(await store.changeStatus(p, next, user.email));
      toast.success(`${p.profileCode} ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (e) {
      toast.error(errorMessage(e, 'Status change failed'), { duration: 8000 });
    }
  };
  const runAction = async ({ action }: PendingAction) => {
    if (action === 'delete') {
      try {
        await store.remove(p.id);
        toast.success(`${p.profileCode} deleted`);
        router.replace(`/admin/pricing/${p.category}`);
        router.refresh();
        return;
      } catch (e) {
        toast.error(errorMessage(e, 'Delete failed'));
      }
    } else {
      await toggle();
    }
    setPending(null);
  };

  const back = (
    <Button variant="outline" onClick={() => router.push(`/admin/pricing/${p.category}`)} className="h-10 gap-1.5 rounded-xl" {...tid('detail-back')}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Button>
  );

  return (
    <div className="space-y-6" {...tid('rate-profile-detail')}>
      <PageHeader id="detail-title" eyebrow={`Rate Management · ${meta.label}`} title={title}
        subtitle={`Profile ${p.profileCode} · v${p.version} · last updated ${fmtStamp(p.updatedAt)}`} action={back} />
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white"><Plane className="h-6 w-6" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-mono text-slate-500">{p.profileCode}</span>
              <span className="rounded bg-sky-50 px-2 py-0.5 font-bold uppercase tracking-widest text-sky-700">{meta.label}</span>
              <StatusPill status={p.status} id="detail-status" />
            </div>
            <div className="mt-1 text-lg font-black text-kwe-ink sm:text-xl">{title}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {nameOf(CARRIERS, p.carrierCode)} · {nameOf(ORIGIN_PORTS, p.originPort)} · {p.serviceType}
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button variant="outline" className="gap-1.5 rounded-xl" {...tid('detail-edit')} onClick={() => router.push(`/admin/pricing/profile/${p.id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" className="gap-1.5 rounded-xl" {...tid('detail-clone')} onClick={() => router.push(`/admin/pricing/${p.category}/new?cloneFrom=${p.id}`)}>
            <Copy className="h-4 w-4" /> Clone
          </Button>
          <Button variant="outline" className={cn('gap-1.5 rounded-xl', active ? 'border-amber-200 text-amber-700' : 'border-emerald-200 text-emerald-700')}
            {...tid('detail-toggle-status')} onClick={() => (active ? setPending({ action: 'deactivate', profile: p }) : void toggle())}>
            {active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />} {active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="outline" className="gap-1.5 rounded-xl border-red-200 text-red-600" {...tid('detail-delete')} onClick={() => setPending({ action: 'delete', profile: p })}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Card>
      <Tabs defaultValue="general" className="kwe-shadow rounded-2xl border border-slate-100 bg-white p-4">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border-b border-slate-100 bg-transparent p-0">
          <TabsTrigger value="general" {...tid('detail-tab-general')} className={TAB}><FileText className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="breaks" {...tid('detail-tab-weight-breaks')} className={TAB}><Layers className="h-4 w-4" /> Weight Breaks</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="pt-4"><GeneralInfo p={p} /></TabsContent>
        <TabsContent value="breaks" className="pt-4"><WeightBreaksTable p={p} /></TabsContent>
      </Tabs>
      <ConfirmProfileAction pending={pending} onCancel={() => setPending(null)} onConfirm={runAction} />
    </div>
  );
}
