import type { Clock } from '@/core/clock/Clock';
import { InMemoryDomainEventBus } from '@/core/events/DomainEventBus';
import type { Tx } from '@/core/transaction/UnitOfWork';

import {
  FakeConnectivity,
  FakeProgressRemote,
  immediateUnitOfWork,
  InMemoryQuizProgressRepository,
  InMemorySyncStateRepository,
} from '../testing/fakes';
import { ResetProgressUseCase } from './ResetProgressUseCase';

const NOW = '2026-11-15T12:00:00.000Z';
const clock: Clock = { nowIso: () => NOW, todayLocal: () => '2026-11-15' };
const saved = {
  quizId: 101,
  passed: true,
  bestScore: 2,
  attempts: 1,
  passedAt: NOW,
  updatedAt: NOW,
};

async function setup(online = true) {
  const remote = new FakeProgressRemote(NOW);
  remote.rows.set(101, saved);
  const progress = new InMemoryQuizProgressRepository();
  await progress.save(saved, {} as Tx, { synced: true });
  const state = new InMemorySyncStateRepository();
  state.state = { generation: 0, lastSyncedAt: NOW, lastError: null };
  const useCase = new ResetProgressUseCase(
    progress,
    state,
    remote,
    immediateUnitOfWork,
    new FakeConnectivity(online),
    clock,
    new InMemoryDomainEventBus(),
  );
  return { remote, progress, state, useCase };
}

describe('ResetProgressUseCase', () => {
  it('borra en la nube y en el teléfono, y guarda la nueva generación', async () => {
    const { remote, progress, state, useCase } = await setup();

    expect(await useCase.execute()).toEqual({ ok: true, value: undefined });
    expect(remote.rows.size).toBe(0);
    expect(await progress.find(101)).toBeNull();
    expect(state.state.generation).toBe(1);
  });

  it('sin red no borra nada', async () => {
    const { remote, progress, useCase } = await setup(false);

    expect(await useCase.execute()).toEqual({ ok: false, error: 'OFFLINE' });
    expect(remote.rows.size).toBe(1);
    expect(await progress.find(101)).not.toBeNull();
  });

  it('si la nube falla, el avance local se conserva', async () => {
    const { remote, progress, useCase } = await setup();
    remote.fail = 'NETWORK';

    expect(await useCase.execute()).toEqual({ ok: false, error: 'NETWORK' });
    expect(await progress.find(101)).not.toBeNull();
  });
});
