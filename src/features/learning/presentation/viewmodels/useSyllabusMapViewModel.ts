import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';
import { FINAL_EXAM_ID } from '@/features/quizzes';

import { toSyllabusMapVm, type SyllabusMapVm } from './syllabusMapVm';

export type SyllabusMapState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; map: SyllabusMapVm };

/** Ruta de temas de un nivel. Sin `levelId` muestra el nivel actual del alumno. */
export function useSyllabusMapViewModel(levelId?: number) {
  const { learning } = useContainer();
  const [state, setState] = useState<SyllabusMapState>({ status: 'loading' });

  // Se recarga al volver a la pestaña: al aprobar un ejercicio cambia la ruta.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const course = await learning.getCourseProgress.execute();
        const target = levelId ?? course.currentLevelId ?? 1;
        const syllabus = await learning.getSyllabus.execute({ levelId: target });
        if (!active) return;
        setState(
          syllabus.ok
            ? { status: 'ready', map: toSyllabusMapVm(syllabus.value, course) }
            : { status: 'error', message: 'No encontramos la ruta de este nivel.' },
        );
      })();
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
  const openExam = useCallback(
    () =>
      router.push({ pathname: '/ejercicio/[quizId]', params: { quizId: String(FINAL_EXAM_ID) } }),
    [],
  );
  const openLevel = useCallback((id: number) => router.setParams({ level: String(id) }), []);

  return { state, openTopic, openExam, openLevel };
}
