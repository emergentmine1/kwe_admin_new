import { ShieldAlert } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NOT_AUTHORIZED_MESSAGE } from '@/lib/auth/roles';
import { getAuthState } from '@/lib/server/session';

export default async function AccessDeniedPage() {
  const state = await getAuthState();
  const text = state.status === 'unavailable' ? state.message : NOT_AUTHORIZED_MESSAGE;

  return (
    <div id="access-denied-page" data-testid="access-denied-page" className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 sm:px-6">
      <div className="kwe-shadow w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-center sm:p-10">
        <BrandLogo className="mx-auto h-9" id="access-denied-logo" />
        <ShieldAlert className="mx-auto mt-8 h-10 w-10 text-rose-500" />
        <h1 className="mt-3 text-2xl font-black tracking-tight text-kwe-ink">Access denied</h1>
        <p id="access-denied-message" data-testid="access-denied-message" className="mt-3 text-sm leading-relaxed text-slate-600">
          {text}
        </p>
        <LogoutButton
          id="access-denied-logout"
          label="Log out and return to login"
          className="mt-8 h-11 w-full rounded-xl bg-kwe-ink text-white hover:bg-slate-800"
        />
      </div>
    </div>
  );
}
