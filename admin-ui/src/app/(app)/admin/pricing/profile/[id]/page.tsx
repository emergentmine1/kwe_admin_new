import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileDetail } from '@/components/rates/RateProfileDetail';
import { WRITE_ROLE } from '@/lib/auth/roles';
import { serverGetProfile } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

export default async function RateProfileDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { user, permitted } = await requireUser(WRITE_ROLE);
  if (!permitted) return <NoPermission role={user.role} />;
  return <RateProfileDetail key={id} id={id} initialProfile={await serverGetProfile(id)} />;
}
