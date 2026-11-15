import { redirect } from 'next/navigation';
import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileForm } from '@/components/rates/RateProfileForm';
import { WRITE_ROLE } from '@/lib/auth/roles';
import { isCategory } from '@/lib/rate-profiles/constants';
import { serverGetProfile } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ cloneFrom?: string }>;
}

export default async function NewRateProfilePage({ params, searchParams }: Readonly<Props>) {
  const { category } = await params;
  if (!isCategory(category)) redirect('/admin/pricing/freight');
  const { user, permitted } = await requireUser(WRITE_ROLE);
  if (!permitted) return <NoPermission role={user.role} />;
  const { cloneFrom } = await searchParams;
  const source = cloneFrom ? await serverGetProfile(cloneFrom) : null;
  return <RateProfileForm key={cloneFrom ?? category} mode="new" routeCategory={category} sourceId={cloneFrom} initialSource={source} />;
}
