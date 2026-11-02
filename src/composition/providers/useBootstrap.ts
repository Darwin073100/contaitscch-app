import { useEffect, useState } from 'react';

import { bootstrap } from '../bootstrap';
import type { Container } from '../container';

/** El contenedor cuando la app está lista; null mientras arranca. Si falla, el error llega al ErrorBoundary. */
export function useBootstrap(): Container | null {
  const [container, setContainer] = useState<Container | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    bootstrap().then(setContainer, setError);
  }, []);

  if (error) throw error;
  return container;
}
