'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/** False during server render and hydration, true afterwards — for browser-only data (localStorage). */
export const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
