import { leaderboardCache } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import type { Ranking } from '../../domain/entities/Ranking';
import { SqliteRankingCache } from './SqliteRankingCache';

const ranking: Ranking = {
  total: 1,
  entries: [
    {
      position: 1,
      firstName: 'Ana',
      lastName: 'López',
      city: null,
      state: 'Chiapas',
      country: 'México',
      levelsCompleted: 1,
      topicsPassed: 5,
      isMe: true,
    },
  ],
  me: null,
};

describe('SqliteRankingCache', () => {
  it('vacía al inicio; guarda y reemplaza el último ranking', async () => {
    const cache = new SqliteRankingCache(await createSeededTestDatabase(), testSession);

    expect(await cache.get()).toBeNull();

    await cache.save({ ...ranking, total: 9 }, '2026-11-14T09:00:00.000Z');
    await cache.save(ranking, '2026-11-15T12:00:00.000Z');

    expect(await cache.get()).toEqual({ ranking, fetchedAt: '2026-11-15T12:00:00.000Z' });
  });

  it('un JSON de otra forma se ignora', async () => {
    const db = await createSeededTestDatabase();
    const cache = new SqliteRankingCache(db, testSession);
    await cache.save(ranking, '2026-11-15T12:00:00.000Z');
    db.update(leaderboardCache).set({ payload: '{"viejo":true}' }).run();

    expect(await cache.get()).toBeNull();
  });
});
