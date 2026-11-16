'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Copy, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from '@/lib/toast';
import { useSession } from '@/components/auth/SessionProvider';
import { LoadingBlock } from '@/components/common/Blocks';
import { PageHeader } from '@/components/common/PageHeader';
import { ProfileHeaderFields } from '@/components/rates/ProfileHeaderFields';
import { RateMatrixEditor } from '@/components/rates/RateMatrixEditor';
import { Button } from '@/components/ui/button';
import { CATEGORIES, categoryOfChargeCode } from '@/lib/rate-profiles/constants';
import { blankForm, collectErrors, formToProfile, profileToForm, type ProfileFormValues } from '@/lib/rate-profiles/form';
import { ProfileConflictError } from '@/lib/rate-profiles/store';
import { errorMessage } from '@/lib/rate-profiles/ui';
import { useProfileStore } from '@/lib/rate-profiles/use-profile-store';
import { profileSchema, type ProfileFormOutput } from '@/lib/rate-profiles/validation';
import type { Category, RateProfile } from '@/lib/rate-profiles/types';
import { tid } from '@/lib/utils';

interface Props {
  /** 'edit' loads `sourceId` as the base; 'new' optionally clones `sourceId`. */
  mode: 'new' | 'edit';
  routeCategory?: Category;
  sourceId?: string;
  initialSource: RateProfile | null;
}

interface Loaded {
  category: Category;
  base: RateProfile | null;
  values: ProfileFormValues;
}

function fromSource(p: RateProfile, mode: Props['mode'], routeCategory?: Category): Loaded {
  if (mode === 'edit') return { category: p.category, base: p, values: profileToForm(p) };
  // Clone: same data, but a brand-new Draft profile until the user saves it.
  const category = routeCategory ?? categoryOfChargeCode(p.chargeCode) ?? p.category;
  return { category, base: null, values: { ...profileToForm(p), status: 'DRAFT' } };
}

export function RateProfileForm({ mode, routeCategory, sourceId, initialSource }: Readonly<Props>) {
  const router = useRouter();
  const store = useProfileStore();
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    if (initialSource) return fromSource(initialSource, mode, routeCategory);
    if (!sourceId && routeCategory) return { category: routeCategory, base: null, values: blankForm(routeCategory) };
    return null;
  });

  useEffect(() => {
    if (loaded || !sourceId) return;
    store.get(sourceId).then((p) => {
      if (!p) {
        toast.error('Rate profile not found');
        router.replace('/admin/pricing');
        return;
      }
      setLoaded(fromSource(p, mode, routeCategory));
    }, (e: unknown) => toast.error(errorMessage(e, 'Could not load rate profile')));
  }, [loaded, sourceId, store, mode, routeCategory, router]);

  if (!loaded) return <LoadingBlock id="profile-form-loading" className="py-24" />;
  return <ProfileEditor {...loaded} cloned={mode === 'new' && !!sourceId} />;
}

function ProfileEditor({ category, base, values, cloned }: Readonly<Loaded & { cloned: boolean }>) {
  const router = useRouter();
  const { user } = useSession();
  const store = useProfileStore();
  const [conflict, setConflict] = useState('');
  const resolver = useMemo(
    () => zodResolver(profileSchema(category)) as unknown as Resolver<ProfileFormValues, unknown, ProfileFormOutput>,
    [category],
  );
  const form = useForm<ProfileFormValues, unknown, ProfileFormOutput>({ resolver, defaultValues: values, mode: 'onBlur' });
  const meta = CATEGORIES[category];

  const onSubmit = async (d: ProfileFormOutput) => {
    setConflict('');
    try {
      const saved = await store.save(formToProfile(d, category, base), user.email);
      toast.success(base ? `${saved.profileCode} updated` : `${saved.profileCode} created`);
      router.replace(`/admin/pricing/profile/${saved.id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ProfileConflictError) {
        setConflict(e.message);
        globalThis.scrollTo({ top: 0, behavior: 'smooth' });
      } else toast.error(errorMessage(e, 'Save failed'));
    }
  };

  let title = `New ${meta.label} Profile`;
  let subtitle = 'Create a new Rate Profile from scratch';
  if (base) {
    title = `Edit · ${base.profileCode}`;
    subtitle = `Version v${base.version} · saving creates v${base.version + 1}`;
  } else if (cloned) {
    title = `New ${meta.label} Profile (clone)`;
    subtitle = 'Pre-filled from an existing profile. Nothing is created until you save.';
  }
  const cancel = (
    <Button variant="outline" onClick={() => router.back()} className="h-10 gap-1.5 rounded-xl" {...tid('form-cancel')} name="form-cancel">
      <ArrowLeft className="h-4 w-4" /> Cancel
    </Button>
  );

  return (
    <div className="space-y-6" {...tid('rate-profile-form')}>
      <PageHeader id="form-title" eyebrow={`Rate Management · ${meta.label}`} title={title} subtitle={subtitle} action={cancel} />
      {cloned && (
        <div {...tid('clone-banner')} className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <Copy className="h-4 w-4 shrink-0" /> Cloned values loaded. Status was reset to Draft — review and save to create the new profile.
        </div>
      )}
      {conflict && (
        <div {...tid('form-conflict-error')} role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {conflict}
        </div>
      )}
      <ErrorSummary errors={form.formState.errors} />
      <form id="rate-profile-form-element" name="rate-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <ProfileHeaderFields form={form} category={category} />
        <RateMatrixEditor form={form} />
        <div className="sticky bottom-16 z-20 -mx-4 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-4 lg:bottom-0 lg:mx-0 lg:rounded-2xl lg:border lg:kwe-shadow">
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => router.back()} {...tid('form-cancel-bottom')} name="form-cancel-bottom">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} {...tid('form-save')} name="form-save"
            className="h-11 gap-1.5 rounded-xl bg-kwe-ink font-semibold text-white hover:bg-slate-800">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {base ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ErrorSummary({ errors }: Readonly<{ errors: unknown }>) {
  const msgs = [...new Set(collectErrors(errors))];
  if (!msgs.length) return null;
  return (
    <div {...tid('form-error-summary')} role="alert" className="rounded-xl border border-red-200 bg-red-50/60 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-red-700">
        <AlertCircle className="h-4 w-4" /> {msgs.length} validation issue{msgs.length === 1 ? '' : 's'}
      </div>
      <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-red-700">
        {msgs.slice(0, 8).map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
