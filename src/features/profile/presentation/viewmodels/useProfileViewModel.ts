import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';
import type { ResetProgressError } from '@/features/quizzes';

import { toProfileVm, type ProfileVm } from './profileVm';

export type ProfileState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: ProfileVm };

/** Confirmación abierta: reiniciar el avance o salir con cambios sin sincronizar. */
export type Confirm = 'reset' | 'logout' | null;

const resetErrors: Record<ResetProgressError, string> = {
  OFFLINE: 'Necesitas conexión para reiniciar tu avance: también se borra de la nube.',
  NETWORK: 'No pudimos reiniciar tu avance. Intenta de nuevo en un momento.',
  INVALID_TOKEN: 'Tu sesión venció. Inicia sesión de nuevo.',
};

/** Pestaña Perfil: datos del alumno, sincronización, avance por nivel y opciones de la cuenta. */
export function useProfileViewModel() {
  const { auth, levels, quizzes, progress, events, clock } = useContainer();
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState<'sync' | 'reset' | 'logout' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [user, overview, exam, sync] = await Promise.all([
      auth.getCurrentUser.execute(),
      levels.getLevelsOverview.execute(),
      quizzes.getFinalExamStatus.execute(),
      progress.getSyncStatus.execute(),
    ]);
    setState(
      overview.ok && exam.ok
        ? {
            status: 'ready',
            profile: toProfileVm(
              { user, levels: overview.value, exam: exam.value, sync },
              clock.nowIso(),
            ),
          }
        : { status: 'error', message: 'No pudimos cargar tu perfil.' },
    );
  }, [auth, levels, quizzes, progress, clock]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // La sincronización en segundo plano cambia el estado y el avance
  useEffect(
    () =>
      events.subscribe((e) => {
        if (e.type === 'SyncStateChanged' || e.type === 'ProgressSynced') void load();
      }),
    [events, load],
  );

  const syncNow = async () => {
    setBusy('sync');
    setMessage(null);
    const result = await progress.syncProgress.execute();
    setBusy(null);
    if (!result.ok) {
      setMessage(
        result.error === 'OFFLINE'
          ? 'Sin conexión: tu avance se sincroniza solo cuando vuelva la red.'
          : 'No se pudo sincronizar. Intenta de nuevo en un momento.',
      );
    }
    await load();
  };

  const reset = async () => {
    setBusy('reset');
    setMessage(null);
    const result = await progress.resetProgress.execute();
    setBusy(null);
    setConfirm(null);
    setMessage(result.ok ? 'Tu avance se reinició.' : resetErrors[result.error]);
    await load();
  };

  const logout = async () => {
    setBusy('logout');
    await auth.logout.execute();
    // El guard de navegación lleva al registro
  };

  const askLogout = () => {
    const pending = state.status === 'ready' ? state.profile.pendingCount : 0;
    if (pending > 0) setConfirm('logout');
    else void logout();
  };

  return {
    state,
    confirm,
    busy,
    message,
    syncNow,
    askReset: () => {
      setMessage(null);
      setConfirm('reset');
    },
    reset,
    askLogout,
    logout,
    cancel: () => setConfirm(null),
    openAbout: () => router.push('/acerca-de'),
    openGlossary: () => router.navigate('/glosario'),
  };
}
