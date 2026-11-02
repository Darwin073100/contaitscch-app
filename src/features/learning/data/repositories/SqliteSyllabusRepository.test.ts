import type { AppDatabase } from '@/core/database/database';
import { subtopicProgress, topicProgress, xpEvents } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteSyllabusRepository } from './SqliteSyllabusRepository';

describe('SqliteSyllabusRepository', () => {
  let db: AppDatabase;
  let repo: SqliteSyllabusRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteSyllabusRepository(db, testSession);
  });

  it('devuelve el nivel y sus temas en orden, sin progreso', async () => {
    const syllabus = await repo.findByLevel(1);

    expect(syllabus?.level).toEqual({
      id: 1,
      name: 'Básico',
      sortOrder: 1,
      title: 'Introducción a la Contabilidad',
      description: 'Domina los cimientos financieros paso a paso.',
    });
    expect(syllabus?.topics.map((t) => t.id)).toEqual([101, 102, 103, 104, 105, 106]);
    expect(syllabus?.topics[3]).toEqual({
      id: 104,
      title: 'Cuentas T (Esquemas de Mayor)',
      sortOrder: 4,
      completed: false,
      viewedSubtopics: 0,
      totalSubtopics: 4,
    });
    expect(syllabus?.examPassed).toBe(false);
  });

  it('refleja los temas completados, los subtemas vistos y el examen aprobado del usuario', async () => {
    const at = testClock.nowIso();
    db.insert(topicProgress).values({ userId: TEST_USER_ID, topicId: 101, completedAt: at }).run();
    db.insert(subtopicProgress)
      .values([
        { userId: TEST_USER_ID, subtopicId: 10201, viewedAt: at },
        { userId: TEST_USER_ID, subtopicId: 10202, viewedAt: at },
      ])
      .run();
    db.insert(xpEvents)
      .values({ userId: TEST_USER_ID, examId: 1, points: 100, earnedAt: at })
      .run();

    const syllabus = await repo.findByLevel(1);

    expect(syllabus?.topics[0].completed).toBe(true);
    expect(syllabus?.topics[1]).toMatchObject({ completed: false, viewedSubtopics: 2 });
    expect(syllabus?.examPassed).toBe(true);
  });

  it('un nivel en preparación no tiene temas', async () => {
    expect((await repo.findByLevel(2))?.topics).toEqual([]);
  });

  it('devuelve null si el nivel no existe', async () => {
    expect(await repo.findByLevel(9)).toBeNull();
  });
});
