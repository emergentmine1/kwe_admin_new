'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AuthMode } from '@/lib/auth/roles';
import { withBasePath } from '@/lib/utils';

export function SsoButton({ mode, from }: Readonly<{ mode: AuthMode; from: string }>) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const query = from ? `?from=${encodeURIComponent(from)}` : '';

  const onSso = () => {
    setRedirecting(true);
    if (mode === 'okta') globalThis.location.assign(withBasePath(`/auth/okta${query}`));
    else router.push(`/login/sso${query}`);
  };

  return (
    <button
      type="button"
      id="login-sso-button"
      name="login-sso-button"
      data-testid="login-sso-button"
      onClick={onSso}
      disabled={redirecting}
      className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#A8954A] bg-[#1A202C] px-8 text-lg font-bold text-white shadow-[0_4px_14px_rgba(26,32,44,0.25)] transition-[transform,background-color] hover:bg-[#2D3748] active:scale-[0.97] disabled:opacity-80"
    >
      {redirecting && <Loader2 className="h-4 w-4 animate-spin" />}
      {redirecting ? 'Redirecting…' : 'Sign in with SSO'}
    </button>
  );
}
