import { redirect } from 'next/navigation';
import { LoginView } from '@/components/auth/LoginView';
import { UNAVAILABLE_MESSAGE } from '@/lib/auth/roles';
import { landingFor } from '@/lib/nav';
import { authMode } from '@/lib/server/config';
import { getAuthState } from '@/lib/server/session';

const ERRORS: Record<string, string> = {
  sso: 'Single sign-on did not complete. Please try again.',
  expired: 'Your session has expired. Please sign in again.',
};

export default async function LoginPage({ searchParams }: Readonly<{ searchParams: Promise<{ from?: string; error?: string }> }>) {
  const { from, error } = await searchParams;
  const state = await getAuthState();
  if (state.status === 'authorized') redirect(landingFor(state.user, from));
  if (state.status === 'denied') redirect('/access-denied');

  let message = error ? ERRORS[error] : undefined;
  if (state.status === 'anonymous') message ??= state.message;
  if (state.status === 'unavailable') message ??= UNAVAILABLE_MESSAGE;

  return <LoginView mode={authMode()} from={from ?? ''} message={message} />;
}
