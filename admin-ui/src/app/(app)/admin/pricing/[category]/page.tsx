import { notFound, redirect } from 'next/navigation';
import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileList } from '@/components/rates/RateProfileList';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { isCategory } from '@/lib/rate-profiles/constants';
import { serverListProfiles } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

export default async function RateProfileListPage({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category } = await params;
  if (category === 'profile') notFound();
  if (!isCategory(category)) redirect('/admin/pricing/freight');
  const { user, permitted } = await requireUser(PERMISSIONS.RATE_VIEW);
  if (!permitted) return <NoPermission user={user} />;
  return <RateProfileList key={category} category={category} initialProfiles={await serverListProfiles(category)} />;
}
