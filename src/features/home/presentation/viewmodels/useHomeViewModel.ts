import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import { toHomeVm, type HomeVm } from './homeVm';

export type HomeState =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; home: HomeVm };

export function useHomeViewModel() {
  const { levels } = useContainer();
  const [state, setState] = useState<HomeState>({ status: 'loading' });

  // Se recarga al volver a la pestaña: completar un tema cambia el progreso.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      levels.getLevelsOverview.execute().then((overview) => {
        if (!active) return;
        setState(
          overview.ok
            ? { status: 'ready', home: toHomeVm(overview.value) }
            : { status: 'error', message: 'Aún no hay niveles disponibles.' },
        );
      });
      return () => {
        active = false;
      };
    }, [levels]),
  );

  // Temporal: Aprender siempre muestra el nivel actual; abrir un nivel concreto queda pendiente.
  const openLevel = useCallback((_levelId: number) => router.navigate('/'), []);
  const openProfile = useCallback(() => router.navigate('/ajustes'), []);
  const openAbout = useCallback(() => router.push('/acerca-de'), []);

  return { state, openLevel, openProfile, openAbout };
}
