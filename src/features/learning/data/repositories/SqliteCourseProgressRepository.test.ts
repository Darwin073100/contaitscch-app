import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteCourseProgressRepository } from './SqliteCourseProgressRepository';

describe('SqliteCourseProgressRepository', () => {
  let db: AppDatabase;
  let repo: SqliteCourseProgressRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteCourseProgressRepository(db, testSession);
  });

  it('devuelve los 24 temas en orden global sin avance', async () => {
    const records = await repo.getLessonRecords();

    expect(records).toHaveLength(24);
    expect(records.slice(3, 5).map((r) => r.topicId)).toEqual([104, 201]);
    expect(records[0]).toEqual({
      topicId: 101,
      levelId: 1,
      levelOrder: 1,
      order: 1,
      title: '¿Qué es la contabilidad?',
      passed: false,
      attempts: 0,
      bestScore: 0,
    });
  });

  it('incluye el avance del usuario y no cuenta el examen final', async () => {
    const at = testClock.nowIso();
    db.insert(quizProgress)
      .values([
        {
          userId: TEST_USER_ID,
          quizId: 101,
          passed: true,
          bestScore: 2,
          attempts: 3,
          passedAt: at,
          updatedAt: at,
        },
        { userId: TEST_USER_ID, quizId: 102, bestScore: 1, attempts: 2, updatedAt: at },
        {
          userId: TEST_USER_ID,
          quizId: 900,
          passed: true,
          bestScore: 9,
          attempts: 1,
          passedAt: at,
          updatedAt: at,
        },
      ])
      .run();

    const records = await repo.getLessonRecords();

    expect(records).toHaveLength(24);
    expect(records[0]).toMatchObject({ passed: true, attempts: 3, bestScore: 2 });
    expect(records[1]).toMatchObject({ passed: false, attempts: 2, bestScore: 1 });
  });
});
