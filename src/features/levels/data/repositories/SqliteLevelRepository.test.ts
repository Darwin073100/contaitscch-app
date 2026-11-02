import type { AppDatabase } from '@/core/database/database';
import { topicProgress, xpEvents } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteLevelRepository } from './SqliteLevelRepository';

describe('SqliteLevelRepository', () => {
  let db: AppDatabase;
  let repo: SqliteLevelRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteLevelRepository(db, testSession);
  });

  it('devuelve los 3 niveles en orden con sus textos y sin progreso', async () => {
    const levels = await repo.getProgress();

    expect(levels.map((l) => l.name)).toEqual(['Básico', 'Intermedio', 'Avanzado']);
    expect(levels[0]).toEqual({
      id: 1,
      name: 'Básico',
      sortOrder: 1,
      subtitle: 'Fundamentos y Cuentas',
      description: expect.stringContaining('Activo, Pasivo, Capital'),
      completedTopics: 0,
      totalTopics: 6,
      examPassed: false,
    });
    expect(levels[1]).toMatchObject({ totalTopics: 0, examPassed: false });
  });

  it('cuenta los temas completados del usuario y el examen aprobado', async () => {
    const at = testClock.nowIso();
    db.insert(topicProgress)
      .values([
        { userId: TEST_USER_ID, topicId: 101, completedAt: at },
        { userId: TEST_USER_ID, topicId: 102, completedAt: at },
      ])
      .run();
    db.insert(xpEvents)
      .values({ userId: TEST_USER_ID, examId: 1, points: 100, earnedAt: at })
      .run();

    const [basico] = await repo.getProgress();

    expect(basico).toMatchObject({ completedTopics: 2, examPassed: true });
  });
});
