import type { Connectivity } from '@/core/connectivity/Connectivity';
import { InMemoryDomainEventBus } from '@/core/events/DomainEventBus';
import type { Session } from '@/core/session/SessionStore';

import { startAutoSync } from './autoSync';
import type { Container } from './container';

const verified: Session = { userId: 'u1', apiToken: 't', email: 'a@b.c', emailVerified: true };

function setup(session: Session | null = verified) {
  const events = new InMemoryDomainEventBus();
  let reconnect = () => {};
  let foreground = () => {};
  const connectivity: Connectivity = {
    isOnline: async () => true,
    onReconnect: (listener) => {
      reconnect = listener;
      return () => {
        reconnect = () => {};
      };
    },
  };
  const execute = jest.fn(async () => ({ ok: true }) as never);
  const container = {
    events,
    connectivity,
    session: { current: () => session } as Container['session'],
    progress: { syncProgress: { execute } } as unknown as Container['progress'],
  };
  const stop = startAutoSync(container, (listener) => {
    foreground = listener;
    return () => {
      foreground = () => {};
    };
  });
  return { events, execute, stop, reconnect: () => reconnect(), foreground: () => foreground() };
}

describe('startAutoSync', () => {
  it('sincroniza al arrancar, al terminar un ejercicio, al reconectar y al volver a la app', () => {
    const { events, execute, reconnect, foreground } = setup();

    events.publish({ type: 'ProgressChanged', quizId: 101 });
    events.publish({ type: 'LevelCompleted', levelId: 1 });
    reconnect();
    foreground();

    expect(execute).toHaveBeenCalledTimes(4);
  });

  it('sin sesión (o sin correo verificado) no sincroniza', () => {
    const { events, execute } = setup({ ...verified, emailVerified: false });

    events.publish({ type: 'ProgressChanged', quizId: 101 });

    expect(execute).not.toHaveBeenCalled();
  });

  it('al detenerla deja de escuchar', () => {
    const { events, execute, stop, reconnect } = setup();
    execute.mockClear();

    stop();
    events.publish({ type: 'ProgressChanged', quizId: 101 });
    reconnect();

    expect(execute).not.toHaveBeenCalled();
  });
});
