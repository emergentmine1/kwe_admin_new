import type { ReactNode } from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { AppShell } from '@/components/layout/AppShell';
import { authMode, dataSource } from '@/lib/server/config';
import { requireUser } from '@/lib/server/session';

export default async function AuthenticatedLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = await requireUser();
  return (
    <SessionProvider user={user} authMode={authMode()} dataSource={dataSource()}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
