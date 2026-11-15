'use client';

import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { tid } from '@/lib/utils';

function MicrosoftLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 23 23" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>
      <span className="text-[26px] font-semibold text-[#737373]">Microsoft</span>
    </div>
  );
}

const LINK = 'block text-left text-ms-blue hover:underline';

interface Props {
  email: string;
  onSignIn: (password: string) => void;
  onAnotherAccount: () => void;
  error: string;
  busy: boolean;
}

// Microsoft Entra-style password step (dummy modes only; real Entra ID shows its own page).
export function MicrosoftPasswordCard({ email, onSignIn, onAnotherAccount, error, busy }: Readonly<Props>) {
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password) onSignIn(password);
  };

  return (
    <div
      {...tid('ms-password-step')}
      className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#EEF0F6] via-[#F5F4F8] to-[#EBEDF5] px-4 font-segoe"
    >
      <form
        id="ms-password-form"
        name="ms-password-form"
        onSubmit={submit}
        className="ms-shadow w-full max-w-[440px] bg-white px-6 py-10 sm:px-11 sm:py-11"
      >
        <MicrosoftLogo />
        <div {...tid('ms-email')} className="mt-6 break-all text-[17px] text-ms-text">
          {email}
        </div>
        <h2 className="mt-3 text-[28px] font-semibold text-ms-text">Enter password</h2>
        {error && (
          <p {...tid('ms-password-error')} role="alert" className="mt-2 text-sm text-ms-error">
            {error}
          </p>
        )}
        <label htmlFor="ms-password-input" className="sr-only">
          Password
        </label>
        <input
          type="password"
          {...tid('ms-password-input')}
          name="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-5 h-10 w-full border-0 border-b border-[#666] bg-transparent text-[17px] outline-hidden placeholder:text-[#666] focus:border-ms-blue"
        />
        <div className="mt-6 space-y-4 text-[15px]">
          <button
            type="button"
            {...tid('ms-forgot-link')}
            onClick={() => setNote('Passwords are managed by KWE IT. Please contact the service desk.')}
            className={LINK}
          >
            Forgot my password
          </button>
          <button
            type="button"
            {...tid('ms-passwordless-link')}
            onClick={() => setNote('Passwordless sign-in is available once KWE single sign-on is connected.')}
            className={LINK}
          >
            Use your face, fingerprint, PIN, or security key instead
          </button>
          <button type="button" {...tid('ms-another-account-link')} onClick={onAnotherAccount} className={LINK}>
            Sign in with another account
          </button>
        </div>
        {note && (
          <p {...tid('ms-note')} className="mt-4 text-xs text-slate-500">
            {note}
          </p>
        )}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            {...tid('ms-signin-button')}
            name="ms-signin-button"
            disabled={busy || !password}
            className="inline-flex h-12 min-w-[160px] items-center justify-center gap-2 bg-[#3264C2] px-6 text-xl text-white transition-colors hover:bg-[#2A55A8] disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
