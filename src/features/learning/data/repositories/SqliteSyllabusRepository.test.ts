import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteSyllabusRepository } from './SqliteSyllabusRepository';

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

describe('SqliteSyllabusRepository', () => {
  let db: AppDatabase;
  let repo: SqliteSyllabusRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteSyllabusRepository(db, testSession);
  });

  it('devuelve el nivel y sus 4 temas en orden, sin avance', async () => {
    const syllabus = await repo.findByLevel(1);

    expect(syllabus?.level).toEqual({
      id: 1,
      name: 'Nivel 1',
      sortOrder: 1,
      title: 'Fundamentos: qué es la contabilidad y para qué sirve',
      description: expect.stringContaining('Al terminar este nivel'),
    });
    expect(syllabus?.topics.map((t) => t.id)).toEqual([101, 102, 103, 104]);
    expect(syllabus?.topics[0]).toEqual({
      id: 101,
      title: '¿Qué es la contabilidad?',
      sortOrder: 1,
      completed: false,
      viewedSubtopics: 0,
      totalSubtopics: 4,
    });
    expect(syllabus?.examPassed).toBe(false);
  });

  it('refleja los temas aprobados; el nivel cuenta como aprobado con sus 4 temas', async () => {
    db.insert(quizProgress)
      .values([passed(101), passed(102)])
      .run();
    // Un intento sin aprobar no cuenta
    db.insert(quizProgress)
      .values({ userId: TEST_USER_ID, quizId: 103, attempts: 2, bestScore: 1, updatedAt: at })
      .run();

    const partial = await repo.findByLevel(1);
    expect(partial?.topics.map((t) => t.completed)).toEqual([true, true, false, false]);
    expect(partial?.examPassed).toBe(false);

    db.insert(quizProgress)
      .values([passed(103), passed(104)])
      .onConflictDoNothing()
      .run();
    db.update(quizProgress).set({ passed: true, passedAt: at }).run();

    expect((await repo.findByLevel(1))?.examPassed).toBe(true);
  });

  it('el avance de otro nivel no se mezcla', async () => {
    db.insert(quizProgress).values(passed(201)).run();

    expect((await repo.findByLevel(1))?.topics.some((t) => t.completed)).toBe(false);
    expect((await repo.findByLevel(2))?.topics[0].completed).toBe(true);
  });

  it('devuelve null si el nivel no existe', async () => {
    expect(await repo.findByLevel(9)).toBeNull();
  });
});
