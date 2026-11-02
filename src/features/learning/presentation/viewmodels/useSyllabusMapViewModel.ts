import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import { toSyllabusMapVm, type SyllabusMapVm } from './syllabusMapVm';

export type SyllabusMapState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; map: SyllabusMapVm };

export function useSyllabusMapViewModel(levelId: number) {
  const { learning } = useContainer();
  const [state, setState] = useState<SyllabusMapState>({ status: 'loading' });

  // Se recarga al volver a la pestaña: al terminar un tema cambia el mapa.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      learning.getSyllabus.execute({ levelId }).then((result) => {
        if (!active) return;
        setState(
          result.ok
            ? { status: 'ready', map: toSyllabusMapVm(result.value) }
            : { status: 'error', message: 'No encontramos el temario de este nivel.' },
        );
      });
      return () => {
        active = false;
      };
    }, [learning, levelId]),
  );

  const openTopic = useCallback(
    (topicId: number) =>
      router.push({ pathname: '/tema/[topicId]', params: { topicId: String(topicId) } }),
    [],
  );
  // ExamIntro aún no existe: se conecta en su spec.
  const openExam = useCallback(() => {}, []);

  return { state, openTopic, openExam };
}
