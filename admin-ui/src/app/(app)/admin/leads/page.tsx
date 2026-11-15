import { LeadsView } from '@/components/leads/LeadsView';
import { requireUser } from '@/lib/server/session';

export default async function LeadsPage() {
  await requireUser();
  return <LeadsView />;
}
