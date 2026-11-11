import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteLevelRepository } from './SqliteLevelRepository';

const at = testClock.nowIso();
const passed = (quizId: number) => ({
  userId: TEST_USER_ID,
  quizId,
  passed: true,
  bestScore: 2,
  attempts: 1,
  passedAt: at,
  updatedAt: at,
});

describe('SqliteLevelRepository', () => {
  let db: AppDatabase;
  let repo: SqliteLevelRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteLevelRepository(db, testSession);
  });

  it('devuelve los 6 niveles en orden con sus textos y sin avance', async () => {
    const levels = await repo.getProgress();

    expect(levels.map((l) => l.name)).toEqual([
      'Nivel 1',
      'Nivel 2',
      'Nivel 3',
      'Nivel 4',
      'Nivel 5',
      'Nivel 6',
    ]);
    expect(levels[0]).toEqual({
      id: 1,
      name: 'Nivel 1',
      sortOrder: 1,
      subtitle: 'Fundamentos: qué es la contabilidad y para qué sirve',
      description: expect.stringContaining('Al terminar este nivel'),
      completedTopics: 0,
      totalTopics: 4,
      examPassed: false,
    });
  });

  it('cuenta los temas aprobados por nivel; el nivel se completa con sus 4 temas', async () => {
    db.insert(quizProgress)
      .values([passed(101), passed(102), passed(103), passed(104), passed(201)])
      .run();

    const [nivel1, nivel2, nivel3] = await repo.getProgress();

    expect(nivel1).toMatchObject({ completedTopics: 4, examPassed: true });
    expect(nivel2).toMatchObject({ completedTopics: 1, examPassed: false });
    expect(nivel3).toMatchObject({ completedTopics: 0, examPassed: false });
  });

  it('el examen integrador aprobado no cuenta como tema', async () => {
    db.insert(quizProgress).values(passed(900)).run();

    const levels = await repo.getProgress();

    expect(levels.every((l) => l.completedTopics === 0)).toBe(true);
  });
});
