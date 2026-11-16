import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import type { SyncAndFetchRankingError } from '../../domain/usecases/SyncAndFetchRankingUseCase';
import { toRankingVm, type RankingVm } from './rankingVm';

export type RankingState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; ranking: RankingVm };

const errorMessages: Record<SyncAndFetchRankingError, string> = {
  OFFLINE: 'Necesitas conexión a internet para ver el ranking por primera vez.',
  NETWORK: 'No pudimos cargar el ranking. Intenta de nuevo en un momento.',
};

/** Pestaña Ranking: al entrar sube el avance pendiente y pide el ranking (o usa el guardado). */
export function useRankingViewModel() {
  const { leaderboard, clock } = useContainer();
  const [state, setState] = useState<RankingState>({ status: 'loading' });
  // Sube con "Reintentar": vuelve a pedir el ranking
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      leaderboard.syncAndFetchRanking.execute().then((result) => {
        if (!active) return;
        setState(
          result.ok
            ? { status: 'ready', ranking: toRankingVm(result.value, clock.nowIso()) }
            : { status: 'error', message: errorMessages[result.error] },
        );
      });
      return () => {
        active = false;
      };
      // attempt: "Reintentar" vuelve a ejecutar el efecto
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leaderboard, clock, attempt]),
  );

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((a) => a + 1);
  }, []);
  const study = useCallback(() => router.navigate('/aprender'), []);

  return { state, retry, study };
}
