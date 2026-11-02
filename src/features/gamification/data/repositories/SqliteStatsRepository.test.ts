import type { AppDatabase } from '@/core/database/database';
import { dailyActivity, xpEvents } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteStatsRepository } from './SqliteStatsRepository';

/** Instante en hora local, guardado en ISO UTC como lo hace el Clock. */
const localIso = (day: number, hour: number) => new Date(2026, 10, day, hour, 0, 0).toISOString();

describe('SqliteStatsRepository', () => {
  let db: AppDatabase;
  let repo: SqliteStatsRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteStatsRepository(db, testSession);
  });

  it('sin actividad: 0 XP y ningún día activo', async () => {
    expect(await repo.getTotal()).toBe(0);
    expect(await repo.getEarnedOn('2026-11-02')).toBe(0);
    expect(await repo.getActiveDays()).toEqual([]);
  });

  it('suma el XP total y el XP de un día local', async () => {
    db.insert(xpEvents)
      .values([
        { userId: TEST_USER_ID, topicId: 101, points: 5, earnedAt: localIso(1, 23) },
        { userId: TEST_USER_ID, topicId: 102, points: 5, earnedAt: localIso(2, 0) },
        { userId: TEST_USER_ID, examId: 1, points: 100, earnedAt: localIso(2, 19) },
      ])
      .run();

    expect(await repo.getTotal()).toBe(110);
    expect(await repo.getEarnedOn('2026-11-02')).toBe(105);
    expect(await repo.getEarnedOn('2026-11-01')).toBe(5);
  });

  it('devuelve los días locales con actividad', async () => {
    db.insert(dailyActivity)
      .values([
        { userId: TEST_USER_ID, activityDate: '2026-11-01' },
        { userId: TEST_USER_ID, activityDate: '2026-11-02' },
      ])
      .run();

    expect((await repo.getActiveDays()).sort()).toEqual(['2026-11-01', '2026-11-02']);
  });
});
