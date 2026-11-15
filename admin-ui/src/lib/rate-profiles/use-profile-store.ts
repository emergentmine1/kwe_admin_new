'use client';

import { useMemo } from 'react';
import { useSession } from '@/components/auth/SessionProvider';
import { profileStore } from '@/lib/rate-profiles/store';

export const useProfileStore = () => {
  const { dataSource } = useSession();
  return useMemo(() => profileStore(dataSource), [dataSource]);
};
