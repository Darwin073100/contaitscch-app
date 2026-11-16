import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';
import { getInitials } from '@/shared/utils';

import { toSyncStatusVm, type SyncStatusVm } from './syncStatusVm';

/** Iniciales del usuario y estado de sincronización de la barra superior de las pestañas. */
export function useTopBarViewModel() {
  const { auth, progress, events, clock } = useContainer();
  const [initials, setInitials] = useState<string>();
  const [sync, setSync] = useState<SyncStatusVm | null>(null);

  const refreshSync = useCallback(() => {
    progress.getSyncStatus.execute().then((s) => setSync(toSyncStatusVm(s, clock.nowIso())));
  }, [progress, clock]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      auth.getCurrentUser.execute().then((user) => {
        if (active && user) setInitials(getInitials(`${user.firstName} ${user.lastName}`));
      });
      refreshSync();
      return () => {
        active = false;
      };
    }, [auth, refreshSync]),
  );

  // Terminar un ejercicio o una sincronización cambia el indicador
  useEffect(
    () =>
      events.subscribe((e) => {
        if (e.type === 'SyncStateChanged' || e.type === 'ProgressChanged') refreshSync();
      }),
    [events, refreshSync],
  );

  const openProfile = useCallback(() => router.navigate('/perfil'), []);

  return { initials, sync, openProfile };
}
