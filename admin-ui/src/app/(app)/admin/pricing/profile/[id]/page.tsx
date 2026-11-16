import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileDetail } from '@/components/rates/RateProfileDetail';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { serverGetProfile } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

export default async function RateProfileDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { user, permitted } = await requireUser(PERMISSIONS.RATE_VIEW);
  if (!permitted) return <NoPermission user={user} />;
  return <RateProfileDetail key={id} id={id} initialProfile={await serverGetProfile(id)} />;
}
