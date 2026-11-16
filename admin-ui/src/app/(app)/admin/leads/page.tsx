import { LeadsView } from '@/components/leads/LeadsView';
import { NoPermission } from '@/components/common/NoPermission';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireUser } from '@/lib/server/session';

export default async function LeadsPage() {
  const { user, permitted } = await requireUser(PERMISSIONS.LEAD_VIEW);
  if (!permitted) return <NoPermission user={user} />;
  return <LeadsView />;
}
