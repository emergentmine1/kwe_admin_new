import { redirect } from 'next/navigation';
import { NoPermission } from '@/components/common/NoPermission';
import { Placeholder } from '@/components/common/Placeholder';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireUser } from '@/lib/server/session';
import { slug } from '@/lib/utils';

// Screens planned but not built yet. Anything else under the app redirects home.
const PLACEHOLDERS: Record<string, string> = {
  'quotes/search': 'Find a Quote',
  'quotes/results': 'Quote Results',
  'quotes/compare': 'Compare Quotes',
  'bookings/new': 'New Booking',
  shipments: 'Shipments',
  invoices: 'Invoices',
  notifications: 'Notifications',
  'provider/dashboard': 'Provider Dashboard',
  'provider/rates': 'Provider Rates',
  'provider/routes': 'Provider Routes',
  'provider/booking-requests': 'Booking Requests',
  'provider/analytics': 'Provider Analytics',
  'admin/providers': 'Provider Management',
};

export default async function PlaceholderPage({ params }: Readonly<{ params: Promise<{ slug: string[] }> }>) {
  const path = (await params).slug.join('/');
  const title = PLACEHOLDERS[path] ?? (path.startsWith('shipments/') ? 'Shipment Details' : undefined);
  if (!title) redirect('/');
  const { user, permitted } = await requireUser(PERMISSIONS.ADMIN_VIEW);
  if (!permitted) return <NoPermission user={user} />;
  return <Placeholder title={title} id={`placeholder-${slug(path)}`} />;
}
