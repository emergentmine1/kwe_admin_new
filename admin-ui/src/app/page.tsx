import { redirect } from 'next/navigation';
import { homeFor } from '@/lib/nav';
import { getAuthState } from '@/lib/server/session';

export default async function HomePage() {
  const state = await getAuthState();
  if (state.status === 'authorized') redirect(homeFor(state.user.role));
  if (state.status === 'denied' || state.status === 'unavailable') redirect('/access-denied');
  redirect('/login');
}
