'use client';

import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { dismissToast, getServerToasts, getToasts, subscribeToasts } from '@/lib/toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts);
  return (
    <section
      id="toast-region"
      data-testid="toast-region"
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          data-testid={`toast-${t.tone}`}
          className={cn(
            'pointer-events-auto flex w-full items-start gap-2 rounded-xl border p-3 text-sm shadow-lg animate-in fade-in slide-in-from-top-2',
            t.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900',
          )}
        >
          {t.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1 break-words">{t.message}</span>
          <button type="button" aria-label="Dismiss notification" data-testid={`toast-close-${t.id}`} onClick={() => dismissToast(t.id)}
            className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </section>
  );
}
