import { eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';

import type { AppDatabase } from '../database';
import {
  contentMeta,
  levels,
  questionOptions,
  questions,
  subtopics,
  topicProgress,
  topics,
  users,
} from '../schema';
import { SqliteUnitOfWork } from '../SqliteUnitOfWork';
import { createTestDatabase } from '../testing/createTestDatabase';
import { ContentSeeder } from './ContentSeeder';
import { loadCourse, type Course } from './loadCourse';

const clock: Clock = {
  nowIso: () => '2026-11-02T18:00:00.000Z',
  todayLocal: () => '2026-11-02',
};

describe('ContentSeeder', () => {
  let db: AppDatabase;
  let seeder: ContentSeeder;
  let course: Course;

  beforeEach(async () => {
    db = await createTestDatabase();
    seeder = new ContentSeeder(db, new SqliteUnitOfWork(db), clock);
    course = loadCourse();
  });

  it('siembra el contenido del bundle y guarda la versión', async () => {
    expect(await seeder.seedIfNeeded(course)).toBe(true);

    expect(db.select().from(levels).all()).toHaveLength(3);
    expect(db.select().from(topics).all()).toHaveLength(6);
    expect(db.select().from(subtopics).all()).toHaveLength(20);
    expect(db.select().from(questions).all()).toHaveLength(10);
    expect(db.select().from(contentMeta).get()?.version).toBe(course.version);
  });

  it('guarda los bloques del subtema como JSON', async () => {
    await seeder.seedIfNeeded(course);

    const row = db.select().from(subtopics).where(eq(subtopics.id, 10402)).get();

    expect(JSON.parse(row!.content)[1]).toMatchObject({ type: 't_account' });
  });

  it('no vuelve a sembrar si la versión no cambió', async () => {
    await seeder.seedIfNeeded(course);

    expect(await seeder.seedIfNeeded(course)).toBe(false);
  });

  it('con una versión mayor actualiza el contenido, reemplaza opciones y conserva el progreso', async () => {
    await seeder.seedIfNeeded(course);
    db.insert(users)
      .values({
        id: 'u1',
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@correo.com',
        country: 'México',
        state: 'Chiapas',
      })
      .run();
    db.insert(topicProgress)
      .values({ userId: 'u1', topicId: 101, completedAt: clock.nowIso() })
      .run();

    const [basico] = course.levels;
    const basicoExam = basico.exam!;
    const firstQuestion = basicoExam.questions[0];
    const updated: Course = {
      version: course.version + 1,
      levels: [
        {
          ...basico,
          topics: basico.topics.map((t) =>
            t.id === 101 ? { ...t, title: 'Conceptos Básicos (revisado)' } : t,
          ),
          exam: {
            ...basicoExam,
            questions: [
              { ...firstQuestion, options: firstQuestion.options.slice(0, 2) },
              ...basicoExam.questions.slice(1),
            ],
          },
        },
      ],
    };

    expect(await seeder.seedIfNeeded(updated)).toBe(true);

    expect(db.select().from(topics).where(eq(topics.id, 101)).get()?.title).toBe(
      'Conceptos Básicos (revisado)',
    );
    expect(
      db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, firstQuestion.id))
        .all(),
    ).toHaveLength(2);
    expect(db.select().from(topicProgress).all()).toHaveLength(1);
    expect(db.select().from(contentMeta).get()?.version).toBe(course.version + 1);
  });
});
