import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileForm } from '@/components/rates/RateProfileForm';
import { WRITE_ROLE } from '@/lib/auth/roles';
import { serverGetProfile } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

export default async function EditRateProfilePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { user, permitted } = await requireUser(WRITE_ROLE);
  if (!permitted) return <NoPermission role={user.role} />;
  return <RateProfileForm key={id} mode="edit" sourceId={id} initialSource={await serverGetProfile(id)} />;
}
