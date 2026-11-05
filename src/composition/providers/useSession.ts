import { useSyncExternalStore } from 'react';

import type { Session } from '@/core/session/SessionStore';

import { useContainer } from './AppProviders';

/** Sesión actual; el componente se vuelve a pintar al iniciar, verificar o cerrar sesión. */
export function useSession(): Session | null {
  const { session } = useContainer();
  return useSyncExternalStore(
    (listener) => session.subscribe(listener),
    () => session.current(),
  );
}
