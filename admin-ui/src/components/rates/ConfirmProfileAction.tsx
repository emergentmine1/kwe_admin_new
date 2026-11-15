'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { PendingAction } from '@/lib/rate-profiles/types';
import { cn, tid } from '@/lib/utils';

const COPY = {
  deactivate: {
    title: 'Deactivate rate profile?',
    body: (code: string) => `${code} will be set to Inactive and stop being used for quotes. You can activate it again later.`,
    confirm: 'Deactivate',
    tone: 'bg-amber-600 hover:bg-amber-700',
  },
  delete: {
    title: 'Delete rate profile?',
    body: (code: string) => `${code} and its whole Rate Matrix will be permanently deleted. This cannot be undone.`,
    confirm: 'Delete',
    tone: 'bg-red-600 hover:bg-red-700',
  },
};

interface Props {
  pending: PendingAction | null;
  onCancel: () => void;
  onConfirm: (p: PendingAction) => Promise<void>;
}

export function ConfirmProfileAction({ pending, onCancel, onConfirm }: Readonly<Props>) {
  const [busy, setBusy] = useState(false);
  const copy = pending ? COPY[pending.action] : null;

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await onConfirm(pending);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => !open && !busy && onCancel()}>
      <AlertDialogContent {...tid('confirm-profile-dialog')}>
        {copy && pending && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle {...tid('confirm-profile-title')}>{copy.title}</AlertDialogTitle>
              <AlertDialogDescription>{copy.body(pending.profile.profileCode)}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel {...tid('confirm-profile-cancel')} disabled={busy}>Cancel</AlertDialogCancel>
              <Button {...tid('confirm-profile-confirm')} name="confirm-profile-confirm" disabled={busy} onClick={() => void confirm()}
                className={cn('gap-1.5 text-white', copy.tone)}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} {copy.confirm}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
