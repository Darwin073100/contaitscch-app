import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import type { Lesson } from '../../domain/entities/Lesson';
import type { GetLessonError } from '../../domain/usecases/GetLessonUseCase';
import { toLessonStepVm } from './lessonVm';

export type LessonState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; lesson: Lesson };

const errorMessages: Record<GetLessonError, string> = {
  LESSON_NOT_FOUND: 'No encontramos este tema.',
  LESSON_LOCKED:
    'Este tema aún está bloqueado: aprueba el ejercicio del tema anterior para abrirlo.',
};

/** Lección de un tema: avanza por sus 4 pasos y al final lleva a su ejercicio. */
export function useLessonViewModel(topicId: number) {
  const { learning } = useContainer();
  const [state, setState] = useState<LessonState>({ status: 'loading' });
  const [step, setStep] = useState(0);

  useEffect(() => {
    let active = true;
    learning.getLesson.execute({ topicId }).then((result) => {
      if (!active) return;
      setState(
        result.ok
          ? { status: 'ready', lesson: result.value }
          : { status: 'error', message: errorMessages[result.error] },
      );
      setStep(0);
    });
    return () => {
      active = false;
    };
  }, [learning, topicId]);

  const stepVm = state.status === 'ready' ? toLessonStepVm(state.lesson, step) : null;

  const exit = () => (router.canGoBack() ? router.back() : router.replace('/aprender'));

  const next = () => {
    if (!stepVm) return;
    if (!stepVm.isLast) {
      setStep((s) => s + 1);
      return;
    }
    // El ejercicio del tema tiene el mismo id que el tema
    router.push({ pathname: '/ejercicio/[quizId]', params: { quizId: String(topicId) } });
  };

  const previous = () => setStep((s) => Math.max(0, s - 1));

  return { state, step: stepVm, next, previous, exit };
}
