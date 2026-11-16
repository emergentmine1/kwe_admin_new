'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { isEmail } from '@/lib/auth/roles';
import logo from '../../../public/Kwe-logo.png';

interface Props {
  initialEmail: string;
  onNext: (email: string) => void;
  hint: string;
}

// Okta-style username step (dummy modes only; real Okta shows its own page).
export function OktaUsernameCard({ initialEmail, onNext, hint }: Readonly<Props>) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError('Please enter a valid username.');
      return;
    }
    onNext(email.trim());
  };

  return (
    <div id="okta-username-step" data-testid="okta-username-step" className="min-h-dvh bg-[#EAEAEC] font-sans">
      <div className="border-b border-slate-200 bg-white/80 px-4 py-5 text-center">
        <div className="flex items-center justify-center gap-2 text-2xl text-slate-500 sm:text-3xl">
          Connecting to <Settings className="h-7 w-7 text-slate-500" />
        </div>
        <div className="mt-1 text-sm text-slate-500">Sign in with your account to access KWE-RATE-QUOTE</div>
      </div>
      <div className="px-4 py-10 sm:py-16">
        <form
          id="okta-username-form"
          name="okta-username-form"
          onSubmit={submit}
          noValidate
          className="mx-auto max-w-[500px] rounded border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex justify-center border-b border-slate-200 py-8">
            <img src={logo.src} width={logo.width} height={logo.height} alt="KWE" className="h-14 w-auto" />
          </div>
          <div className="px-6 py-8 sm:px-14">
            <h2 className="text-center text-lg font-medium text-slate-600">Sign In</h2>
            <label htmlFor="okta-username-input" className="mt-6 block text-base font-semibold text-slate-900">
              Username
            </label>
            <input
              id="okta-username-input"
              name="username"
              data-testid="okta-username-input"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="mt-2 h-12 w-full rounded border border-slate-300 px-3 text-base outline-hidden focus:border-[#1662DD] focus:ring-2 focus:ring-[#1662DD]/25"
            />
            {error && (
              <p id="okta-username-error" data-testid="okta-username-error" className="mt-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              id="okta-next-button"
              name="okta-next-button"
              data-testid="okta-next-button"
              className="mt-8 h-14 w-full rounded bg-[#1662DD] text-lg font-semibold text-white transition-colors hover:bg-[#124FB4]"
            >
              Next
            </button>
            <Link href="/login" id="okta-help-link" data-testid="okta-help-link" className="mt-8 inline-block text-sm text-slate-600 underline">
              Help
            </Link>
          </div>
        </form>
        <div id="dummy-login-hint" data-testid="dummy-login-hint" className="mx-auto mt-4 max-w-[500px] text-center text-[11px] leading-relaxed text-slate-500">
          {hint}
        </div>
      </div>
    </div>
  );
}
