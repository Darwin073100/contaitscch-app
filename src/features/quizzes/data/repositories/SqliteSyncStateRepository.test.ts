import { syncState } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteSyncStateRepository } from './SqliteSyncStateRepository';

describe('SqliteSyncStateRepository', () => {
  it('sin fila: nunca ha sincronizado', async () => {
    const repo = new SqliteSyncStateRepository(
      await createSeededTestDatabase(),
      testSession,
      testClock,
    );

    expect(await repo.get()).toEqual({ generation: null, lastSyncedAt: null, lastError: null });
  });

  it('guarda y actualiza el estado del usuario', async () => {
    const repo = new SqliteSyncStateRepository(
      await createSeededTestDatabase(),
      testSession,
      testClock,
    );

    await repo.save({ generation: 0, lastSyncedAt: null, lastError: 'offline' });
    await repo.save({ generation: 2, lastSyncedAt: '2026-11-15T12:00:00.000Z', lastError: null });

    expect(await repo.get()).toEqual({
      generation: 2,
      lastSyncedAt: '2026-11-15T12:00:00.000Z',
      lastError: null,
    });
  });

  it('un error desconocido en la base se lee como sin error', async () => {
    const db = await createSeededTestDatabase();
    const repo = new SqliteSyncStateRepository(db, testSession, testClock);
    await repo.save({ generation: 0, lastSyncedAt: null, lastError: null });
    db.update(syncState).set({ lastError: 'otro' }).run();

    expect((await repo.get()).lastError).toBeNull();
  });
});
