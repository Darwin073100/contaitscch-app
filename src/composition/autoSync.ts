import { AppState } from 'react-native';

import type { Container } from './container';

/** Avisa cuando la app vuelve a primer plano. Devuelve la función para dejar de escuchar. */
export type ForegroundSource = (listener: () => void) => () => void;

const appForeground: ForegroundSource = (listener) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') listener();
  });
  return () => subscription.remove();
};

/**
 * Sincroniza el avance en segundo plano, sin bloquear ninguna pantalla:
 * al terminar un ejercicio o el examen, al abrir la app, al volver a primer plano y al recuperar
 * la conexión. Solo con sesión iniciada. SyncProgressUseCase evita subidas simultáneas.
 * Devuelve la función para detenerla.
 */
export function startAutoSync(
  container: Pick<Container, 'events' | 'session' | 'connectivity' | 'progress'>,
  onForeground: ForegroundSource = appForeground,
): () => void {
  const sync = () => {
    if (container.session.current()?.emailVerified) void container.progress.syncProgress.execute();
  };

  const stops = [
    container.events.subscribe((event) => {
      if (event.type === 'ProgressChanged') sync();
    }),
    container.connectivity.onReconnect(sync),
    onForeground(sync),
  ];
  sync();
  return () => stops.forEach((stop) => stop());
}
