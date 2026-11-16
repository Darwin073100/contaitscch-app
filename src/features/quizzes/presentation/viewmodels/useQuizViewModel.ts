import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import { FINAL_EXAM_ID, type AnswerCheck, type Quiz } from '../../domain/entities/Quiz';
import type { StartQuizError } from '../../domain/usecases/StartQuizUseCase';
import { toQuestionVm, toResultVm, type ResultTarget, type ResultVm } from './quizVm';

type Answering = {
  status: 'answering';
  quiz: Quiz;
  index: number;
  picked: number | null;
  check: AnswerCheck | null;
  answers: Record<number, number>;
  busy: boolean;
};

export type QuizState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | Answering
  | { status: 'result'; quiz: Quiz; result: ResultVm };

const startErrors: Record<StartQuizError, string> = {
  QUIZ_NOT_FOUND: 'No encontramos este ejercicio.',
  QUIZ_LOCKED: 'Este ejercicio aún está bloqueado.',
};

/** Ejercicio de un tema o examen integrador: responder, comprobar, avanzar y ver el resultado. */
export function useQuizViewModel(quizId: number) {
  const { quizzes, learning } = useContainer();
  const [state, setState] = useState<QuizState>({ status: 'loading' });
  // Sube con "Presentar de nuevo": vuelve a cargar el mismo examen desde la primera pregunta
  const [round, setRound] = useState(0);

  useEffect(() => {
    let active = true;
    quizzes.startQuiz.execute({ quizId }).then((result) => {
      if (!active) return;
      setState(
        result.ok
          ? {
              status: 'answering',
              quiz: result.value,
              index: 0,
              picked: null,
              check: null,
              answers: {},
              busy: false,
            }
          : { status: 'error', message: startErrors[result.error] },
      );
    });
    return () => {
      active = false;
    };
  }, [quizzes, quizId, round]);

  const restart = useCallback(() => {
    setState({ status: 'loading' });
    setRound((r) => r + 1);
  }, []);

  const pick = (optionId: number) =>
    setState((s) => (s.status === 'answering' && !s.check ? { ...s, picked: optionId } : s));

  const check = async () => {
    if (state.status !== 'answering' || state.picked === null || state.check || state.busy) return;
    const question = state.quiz.questions[state.index];
    const picked = state.picked;
    setState({ ...state, busy: true });
    const result = await quizzes.checkAnswer.execute({
      quizId,
      questionId: question.id,
      optionId: picked,
    });
    setState({
      ...state,
      busy: false,
      check: result.ok ? result.value : { correct: false, feedback: null },
      answers: { ...state.answers, [question.id]: picked },
    });
  };

  const next = async () => {
    if (state.status !== 'answering' || !state.check || state.busy) return;
    if (state.index < state.quiz.questions.length - 1) {
      setState({ ...state, index: state.index + 1, picked: null, check: null });
      return;
    }
    setState({ ...state, busy: true });
    const submitted = await quizzes.submitQuiz.execute({ quizId, answers: state.answers });
    if (!submitted.ok) {
      setState({ status: 'error', message: 'No pudimos guardar tu resultado. Intenta de nuevo.' });
      return;
    }
    const course = await learning.getCourseProgress.execute();
    setState({
      status: 'result',
      quiz: state.quiz,
      result: toResultVm(submitted.value, course.nextLesson?.topicId ?? null),
    });
  };

  // Salir del ejercicio regresa a la lección (paso 4); salir del examen, a donde se abrió
  const quit = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const go = (target: ResultTarget) => {
    switch (target.kind) {
      case 'topic':
      case 'retake':
        router.dismissTo({
          pathname: '/tema/[topicId]',
          params: { topicId: String(target.topicId) },
        });
        return;
      case 'exam':
        if (quizId === FINAL_EXAM_ID) restart();
        else
          router.replace({
            pathname: '/ejercicio/[quizId]',
            params: { quizId: String(FINAL_EXAM_ID) },
          });
        return;
      case 'route':
        router.dismissTo({ pathname: '/aprender', params: { level: String(target.levelId) } });
        return;
      case 'home':
        router.dismissTo('/');
    }
  };

  const question =
    state.status === 'answering'
      ? toQuestionVm(state.quiz, state.index, state.picked, state.check)
      : null;

  return { state, question, pick, check, next, quit, go };
}
