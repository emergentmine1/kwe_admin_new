import { NoPermission } from '@/components/common/NoPermission';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireUser } from '@/lib/server/session';

export default async function QuotesPage() {
  const { user, permitted } = await requireUser(PERMISSIONS.QUOTE_VIEW);
  if (!permitted) return <NoPermission user={user} />;
  return <div id="admin-quotes-blank" data-testid="admin-quotes-blank" className="min-h-[400px]" />;
}
