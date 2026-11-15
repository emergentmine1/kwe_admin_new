import { requireUser } from '@/lib/server/session';

export default async function QuotesPage() {
  await requireUser();
  return <div id="admin-quotes-blank" data-testid="admin-quotes-blank" className="min-h-[400px]" />;
}
