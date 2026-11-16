import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';
import { FINAL_EXAM_ID } from '@/features/quizzes';

import { tips } from '../content/tips';
import { toHomeVm, type HomeVm } from './homeVm';

export type HomeState =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; home: HomeVm };

/** Índice de otro tip distinto al actual. */
function otherTip(current: number): number {
  if (tips.length < 2) return 0;
  const next = Math.floor(Math.random() * (tips.length - 1));
  return next >= current ? next + 1 : next;
}

export function useHomeViewModel() {
  const { auth, learning, levels, quizzes } = useContainer();
  const [state, setState] = useState<HomeState>({ status: 'loading' });
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));

  // Se recarga al volver a la pestaña: aprobar un ejercicio cambia el avance.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        auth.getCurrentUser.execute(),
        learning.getCourseProgress.execute(),
        levels.getLevelsOverview.execute(),
        quizzes.getFinalExamStatus.execute(),
      ]).then(([user, course, overview, exam]) => {
        if (!active) return;
        setState(
          overview.ok && exam.ok
            ? {
                status: 'ready',
                home: toHomeVm({
                  user,
                  course,
                  levels: overview.value,
                  exam: exam.value,
                  tip: tips[tipIndex],
                }),
              }
            : { status: 'error', message: 'Aún no hay niveles disponibles.' },
        );
      });
      return () => {
        active = false;
      };
    }, [auth, learning, levels, quizzes, tipIndex]),
  );

  const openTopic = useCallback(
    (topicId: number) =>
      router.push({ pathname: '/tema/[topicId]', params: { topicId: String(topicId) } }),
    [],
  );
  const openLevel = useCallback(
    (levelId: number) =>
      router.navigate({ pathname: '/aprender', params: { level: String(levelId) } }),
    [],
  );
  const openExam = useCallback(
    () =>
      router.push({ pathname: '/ejercicio/[quizId]', params: { quizId: String(FINAL_EXAM_ID) } }),
    [],
  );
  const openAbout = useCallback(() => router.push('/acerca-de'), []);
  const nextTip = useCallback(() => setTipIndex(otherTip), []);

  return { state, openTopic, openLevel, openExam, openAbout, nextTip };
}
