import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import type { TopicSession } from '../../domain/entities/TopicSession';
import { toTopicStepVm } from './topicSessionVm';

export type TopicSessionState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; session: TopicSession };

/** Sesión de un tema: avanza por sus subtemas y al final lo marca como completado. */
export function useTopicSessionViewModel(topicId: number) {
  const { learning } = useContainer();
  const [state, setState] = useState<TopicSessionState>({ status: 'loading' });
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let active = true;
    learning.getTopicSession.execute({ topicId }).then((result) => {
      if (!active) return;
      if (result.ok) {
        setState({ status: 'ready', session: result.value });
        setStep(result.value.startStep);
      } else {
        setState({ status: 'error', message: 'Este tema todavía no tiene contenido disponible.' });
      }
    });
    return () => {
      active = false;
    };
  }, [learning, topicId]);

  const stepVm = state.status === 'ready' ? toTopicStepVm(state.session, step) : null;

  // Al regresar, el mapa se recarga solo (useFocusEffect) y muestra el tema completado.
  const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const next = async () => {
    if (!stepVm || completing) return;
    if (!stepVm.isLast) {
      setStep((s) => s + 1);
      return;
    }
    setCompleting(true);
    const result = await learning.completeTopic.execute({ topicId });
    if (result.ok) {
      exit();
      return;
    }
    setCompleting(false);
    setState({ status: 'error', message: 'No pudimos guardar tu avance. Intenta de nuevo.' });
  };

  const previous = () => setStep((s) => Math.max(0, s - 1));

  return { state, step: stepVm, completing, next, previous, exit };
}
