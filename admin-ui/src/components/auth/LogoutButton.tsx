'use client';

import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn, withBasePath } from '@/lib/utils';

export async function signOut() {
  try {
    const res = await fetch(withBasePath('/auth/logout'), { method: 'POST' });
    const body = (await res.json()) as { redirect?: string };
    globalThis.location.assign(body.redirect ?? withBasePath('/login'));
  } catch {
    globalThis.location.assign(withBasePath('/login'));
  }
}

interface Props {
  id: string;
  label: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function LogoutButton({ id, label, className, variant = 'default' }: Readonly<Props>) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      id={id}
      name={id}
      data-testid={id}
      variant={variant}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void signOut();
      }}
      className={cn('gap-2', className)}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} {label}
    </Button>
  );
}
