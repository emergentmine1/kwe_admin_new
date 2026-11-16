'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { UNAUTHORIZED_EVENT } from '@/lib/api-client';
import type { AuthMode, DataSource, SessionUser } from '@/lib/auth/roles';

interface SessionContextValue {
  user: SessionUser;
  authMode: AuthMode;
  dataSource: DataSource;
  can: (permission: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);
const REVALIDATE_MS = 5 * 60 * 1000;

interface Props {
  user: SessionUser;
  authMode: AuthMode;
  dataSource: DataSource;
  children: ReactNode;
}

/** Client view of the server-verified session. Re-runs the server permission check every 5 minutes. */
export function SessionProvider({ user, authMode, dataSource, children }: Readonly<Props>) {
  const router = useRouter();

  useEffect(() => {
    const onUnauthorized = () => router.replace('/login?error=expired');
    globalThis.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    const timer = setInterval(() => router.refresh(), REVALIDATE_MS);
    return () => {
      globalThis.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      clearInterval(timer);
    };
  }, [router]);

  const value = useMemo(
    () => ({ user, authMode, dataSource, can: (permission: string) => user.permissions.includes(permission) }),
    [user, authMode, dataSource],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
