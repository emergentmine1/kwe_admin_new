import { ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { homeFor } from '@/lib/nav';
import type { SessionUser } from '@/lib/auth/roles';

export function NoPermission({ user }: Readonly<{ user: SessionUser }>) {
  return (
    <div id="no-permission" data-testid="no-permission" className="kwe-shadow mx-auto mt-16 max-w-lg rounded-2xl border border-slate-100 bg-white p-6 text-center sm:p-10">
      <ShieldOff className="mx-auto mb-3 h-9 w-9 text-rose-500" />
      <h1 className="text-xl font-black text-kwe-ink">You don&apos;t have access to this page</h1>
      <p className="mt-2 text-sm text-slate-500">Your permissions don&apos;t include this area. Ask your administrator if you need it.</p>
      <Link href={homeFor(user)} id="no-permission-home" data-testid="no-permission-home" className="mt-6 inline-block text-sm font-semibold text-kwe-blue hover:underline">
        Go to my home page
      </Link>
    </div>
  );
}
