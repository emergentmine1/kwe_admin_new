'use client';

import { useState } from 'react';
import { MicrosoftPasswordCard } from '@/components/auth/MicrosoftPasswordCard';
import { OktaUsernameCard } from '@/components/auth/OktaUsernameCard';
import { useHydrated } from '@/lib/use-hydrated';
import { withBasePath } from '@/lib/utils';

const LAST_EMAIL_KEY = 'kwe_admin_last_email';

export function SsoFlow({ from, hint }: Readonly<{ from: string; hint: string }>) {
  const [email, setEmail] = useState('');
  const hydrated = useHydrated();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signIn = async (password: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(withBasePath('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, from }),
      });
      const body = (await res.json()) as { redirect?: string; message?: string };
      if (!res.ok || !body.redirect) {
        setError(res.status === 503 && body.message ? body.message : 'Your account or password is incorrect.');
        setBusy(false);
        return;
      }
      localStorage.setItem(LAST_EMAIL_KEY, email);
      // Full load: the signed-in app starts with a fresh document and CSP nonce.
      globalThis.location.assign(withBasePath(body.redirect));
    } catch {
      setError('Could not reach the sign-in service. Please try again.');
      setBusy(false);
    }
  };

  if (!email) {
    if (!hydrated) return null;
    return <OktaUsernameCard initialEmail={localStorage.getItem(LAST_EMAIL_KEY) ?? ''} onNext={setEmail} hint={hint} />;
  }
  return (
    <MicrosoftPasswordCard
      email={email}
      busy={busy}
      error={error}
      onSignIn={signIn}
      onAnotherAccount={() => {
        setEmail('');
        setError('');
      }}
    />
  );
}
