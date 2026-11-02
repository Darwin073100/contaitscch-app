import { useEffect, useState } from 'react';

import { bootstrap } from '../bootstrap';

/** true cuando la base local está lista. Si el arranque falla, el error llega al ErrorBoundary. */
export function useBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    bootstrap().then(() => setReady(true), setError);
  }, []);

  if (error) throw error;
  return ready;
}
