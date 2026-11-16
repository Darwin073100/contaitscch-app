import type { Tx } from '@/core/transaction/UnitOfWork';

import type { SyncState } from '../entities/Sync';
import {
  FakeConnectivity,
  InMemoryQuizProgressRepository,
  InMemorySyncStateRepository,
} from '../testing/fakes';
import { GetSyncStatusUseCase } from './GetSyncStatusUseCase';

const T1 = '2026-11-10T10:00:00.000Z';

async function status({
  online = true,
  pending = 0,
  state = {},
}: {
  online?: boolean;
  pending?: number;
  state?: Partial<SyncState>;
} = {}) {
  const progress = new InMemoryQuizProgressRepository();
  for (let i = 0; i < pending; i++) {
    await progress.save(
      { quizId: 101 + i, passed: false, bestScore: 0, attempts: 1, passedAt: null, updatedAt: T1 },
      {} as Tx,
    );
  }
  const repo = new InMemorySyncStateRepository();
  repo.state = { generation: 0, lastSyncedAt: null, lastError: null, ...state };
  return new GetSyncStatusUseCase(progress, repo, new FakeConnectivity(online)).execute();
}

describe('GetSyncStatusUseCase', () => {
  it('sincronizado: sin pendientes y con fecha de la última vez', async () => {
    expect(await status({ state: { lastSyncedAt: T1 } })).toEqual({
      status: 'synced',
      pendingCount: 0,
      lastSyncedAt: T1,
    });
  });

  it('pendiente: cuenta los cambios sin subir', async () => {
    expect(await status({ pending: 3, state: { lastSyncedAt: T1 } })).toMatchObject({
      status: 'pending',
      pendingCount: 3,
    });
  });

  it('sin red manda sobre lo demás', async () => {
    expect((await status({ online: false, pending: 2 })).status).toBe('offline');
  });

  it('error si falló la última sincronización (no por estar sin red)', async () => {
    expect((await status({ state: { lastError: 'network' } })).status).toBe('error');
    expect((await status({ state: { lastError: 'offline', lastSyncedAt: T1 } })).status).toBe(
      'synced',
    );
  });

  it('nunca sincronizado y sin nada pendiente', async () => {
    expect((await status()).status).toBe('never');
  });
});
