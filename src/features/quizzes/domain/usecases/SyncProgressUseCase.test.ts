import type { Clock } from '@/core/clock/Clock';
import { InMemoryDomainEventBus, type DomainEvent } from '@/core/events/DomainEventBus';
import type { Tx } from '@/core/transaction/UnitOfWork';

import type { QuizProgress } from '../entities/QuizProgress';
import {
  FakeConnectivity,
  FakeProgressRemote,
  immediateUnitOfWork,
  InMemoryQuizProgressRepository,
  InMemorySyncStateRepository,
} from '../testing/fakes';
import { SyncProgressUseCase } from './SyncProgressUseCase';

const T1 = '2026-11-10T10:00:00.000Z';
const NOW = '2026-11-15T12:00:00.000Z';
const clock: Clock = { nowIso: () => NOW, todayLocal: () => '2026-11-15' };
const tx = {} as Tx;

const row = (quizId: number, overrides: Partial<QuizProgress> = {}): QuizProgress => ({
  quizId,
  passed: true,
  bestScore: 2,
  attempts: 1,
  passedAt: T1,
  updatedAt: T1,
  ...overrides,
});

/** Un teléfono: su SQLite en memoria conectado a la nube compartida. */
function phone(remote: FakeProgressRemote, connectivity = new FakeConnectivity()) {
  const progress = new InMemoryQuizProgressRepository();
  const state = new InMemorySyncStateRepository();
  const events: DomainEvent['type'][] = [];
  const bus = new InMemoryDomainEventBus();
  bus.subscribe((e) => events.push(e.type));
  const session = { clear: jest.fn(async () => undefined) };
  const sync = new SyncProgressUseCase(
    progress,
    state,
    remote,
    immediateUnitOfWork,
    connectivity,
    clock,
    bus,
    session,
  );
  return { progress, state, events, session, sync, connectivity };
}

describe('SyncProgressUseCase', () => {
  it('sin red no llama a la nube y deja el error "offline"', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote, new FakeConnectivity(false));

    expect(await p.sync.execute()).toEqual({ ok: false, error: 'OFFLINE' });
    expect(remote.calls).toBe(0);
    expect(p.state.state.lastError).toBe('offline');
    expect(p.events).toEqual(['SyncStateChanged']);
  });

  it('teléfono nuevo: restaura el avance de la nube y adopta su generación', async () => {
    const remote = new FakeProgressRemote(NOW);
    remote.rows.set(101, row(101));
    remote.generation = 2;
    const p = phone(remote);

    expect(await p.sync.execute()).toEqual({ ok: true, value: { kind: 'replaced', pushed: 0 } });
    expect(await p.progress.find(101)).toEqual(row(101));
    expect(await p.progress.countPending()).toBe(0);
    expect(p.state.state).toEqual({ generation: 2, lastSyncedAt: NOW, lastError: null });
    expect(p.events).toEqual(['ProgressSynced', 'SyncStateChanged']);
  });

  it('sube lo pendiente y queda sincronizado', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);
    p.state.state = { generation: 0, lastSyncedAt: null, lastError: null };
    await p.progress.save(row(101), tx);

    expect(await p.sync.execute()).toEqual({ ok: true, value: { kind: 'merged', pushed: 1 } });
    expect(remote.rows.get(101)).toEqual(row(101));
    expect(await p.progress.countPending()).toBe(0);
    expect(p.state.state.lastSyncedAt).toBe(NOW);
  });

  it('con el reloj adelantado no deja filas pendientes para siempre', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);
    p.state.state = { generation: 0, lastSyncedAt: null, lastError: null };
    await p.progress.save(row(101, { updatedAt: '2100-01-01T00:00:00.000Z' }), tx);

    await p.sync.execute();

    expect(await p.progress.countPending()).toBe(0);
    expect((await p.progress.find(101))?.updatedAt).toBe(NOW);
  });

  it('un ejercicio terminado mientras se subía queda pendiente para la siguiente vez', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);
    p.state.state = { generation: 0, lastSyncedAt: null, lastError: null };
    await p.progress.save(row(101), tx);
    remote.onSync = async () => {
      await p.progress.save(row(101, { attempts: 2, updatedAt: '2026-11-15T11:00:00.000Z' }), tx);
    };

    await p.sync.execute();

    expect((await p.progress.find(101))?.attempts).toBe(2);
    expect(await p.progress.countPending()).toBe(1);
  });

  it('error de red: no marca nada y lo reintenta después', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);
    p.state.state = { generation: 0, lastSyncedAt: null, lastError: null };
    await p.progress.save(row(101), tx);
    remote.fail = 'NETWORK';

    expect(await p.sync.execute()).toEqual({ ok: false, error: 'NETWORK' });
    expect(await p.progress.countPending()).toBe(1);
    expect(p.state.state.lastError).toBe('network');

    remote.fail = null;
    await p.sync.execute();
    expect(await p.progress.countPending()).toBe(0);
    expect(p.state.state.lastError).toBeNull();
  });

  it('api_token inválido: cierra la sesión', async () => {
    const remote = new FakeProgressRemote(NOW);
    remote.fail = 'INVALID_TOKEN';
    const p = phone(remote);

    expect(await p.sync.execute()).toEqual({ ok: false, error: 'INVALID_TOKEN' });
    expect(p.session.clear).toHaveBeenCalled();
  });

  it('dos llamadas al mismo tiempo comparten una sola subida', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);

    await Promise.all([p.sync.execute(), p.sync.execute()]);

    expect(remote.calls).toBe(1);
  });

  it('dos teléfonos: ninguno pierde lo aprobado en el otro', async () => {
    const remote = new FakeProgressRemote(NOW);
    const a = phone(remote);
    const b = phone(remote);
    await a.sync.execute();
    await b.sync.execute();
    await a.progress.save(row(101), tx);
    await b.progress.save(
      row(101, { passed: false, bestScore: 1, attempts: 3, passedAt: null }),
      tx,
    );
    await b.progress.save(row(102), tx);

    await a.sync.execute();
    await b.sync.execute();
    await a.sync.execute();

    for (const p of [a, b]) {
      expect(await p.progress.find(101)).toMatchObject({ passed: true, bestScore: 2, attempts: 3 });
      expect(await p.progress.find(102)).toMatchObject({ passed: true });
      expect(await p.progress.countPending()).toBe(0);
    }
  });

  it('después de un reinicio en otro teléfono, el avance viejo se reemplaza y no se sube', async () => {
    const remote = new FakeProgressRemote(NOW);
    const p = phone(remote);
    await p.sync.execute();
    await p.progress.save(row(101), tx);
    await remote.reset();

    expect(await p.sync.execute()).toEqual({ ok: true, value: { kind: 'replaced', pushed: 1 } });
    expect(await p.progress.find(101)).toBeNull();
    expect(remote.rows.size).toBe(0);
    expect(p.state.state.generation).toBe(1);
  });
});
