import { redirect } from 'next/navigation';
import { SsoFlow } from '@/components/auth/SsoFlow';
import { landingFor } from '@/lib/nav';
import { authMode } from '@/lib/server/config';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/server/demo-users';
import { getAuthState } from '@/lib/server/session';

// TEMPORARY dummy SSO (static / demo modes): mimics Okta username → Microsoft password.
export default async function SsoSignInPage({ searchParams }: Readonly<{ searchParams: Promise<{ from?: string }> }>) {
  const mode = authMode();
  if (mode === 'okta') redirect('/login');
  const { from } = await searchParams;
  const state = await getAuthState();
  if (state.status === 'authorized') redirect(landingFor(state.user.role, from));

  const accounts = DEMO_ACCOUNTS.map((a) => `${a.email} (${a.note})`).join(' · ');
  const password = mode === 'demo' ? ` · password ${DEMO_PASSWORD}` : '';
  const hint = `Temporary dummy sign-in · ${accounts}${password}`;
  return <SsoFlow from={from ?? ''} hint={hint} />;
}
