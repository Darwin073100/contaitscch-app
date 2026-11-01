import { router } from 'expo-router';
import { useCallback } from 'react';

import { aboutContent } from '../content/aboutContent';

/** Pantalla estática: solo expone el contenido y la navegación. */
export function useAboutViewModel() {
  // Si se abrió por enlace profundo no hay a dónde regresar: se va a Niveles.
  const goBack = useCallback(
    () => (router.canGoBack() ? router.back() : router.replace('/niveles')),
    [],
  );
  const startLearning = useCallback(() => router.navigate('/'), []);

  return { content: aboutContent, goBack, startLearning };
}
