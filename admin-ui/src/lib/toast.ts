'use client';

// Minimal toast store. Replaces a library that injected an inline <style> tag (blocked by our CSP).
export type ToastTone = 'success' | 'error';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  duration: number;
}

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(items));

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(tone: ToastTone, message: string, opts?: { duration?: number }) {
  const item = { id: nextId++, tone, message, duration: opts?.duration ?? 4000 };
  items = [...items.slice(-4), item];
  emit();
  setTimeout(() => dismissToast(item.id), item.duration);
}

export const toast = {
  success: (message: string, opts?: { duration?: number }) => push('success', message, opts),
  error: (message: string, opts?: { duration?: number }) => push('error', message, opts),
};

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getToasts = () => items;
const EMPTY: ToastItem[] = [];
export const getServerToasts = () => EMPTY;
