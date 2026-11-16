import { NoPermission } from '@/components/common/NoPermission';
import { RateProfileForm } from '@/components/rates/RateProfileForm';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { serverGetProfile } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/session';

export default async function EditRateProfilePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { user, permitted } = await requireUser(PERMISSIONS.RATE_EDIT);
  if (!permitted) return <NoPermission user={user} />;
  return <RateProfileForm key={id} mode="edit" sourceId={id} initialSource={await serverGetProfile(id)} />;
}
