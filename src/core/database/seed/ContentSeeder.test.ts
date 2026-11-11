import { eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';

import type { AppDatabase } from '../database';
import {
  contentMeta,
  glossaryTerms,
  levels,
  questionOptions,
  questions,
  quizProgress,
  quizzes,
  topics,
  users,
} from '../schema';
import { SqliteUnitOfWork } from '../SqliteUnitOfWork';
import { createTestDatabase } from '../testing/createTestDatabase';
import { ContentSeeder } from './ContentSeeder';
import { FINAL_EXAM_ID, LessonBodySchema } from './courseSchema';
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

    expect(db.select().from(levels).all()).toHaveLength(6);
    expect(db.select().from(topics).all()).toHaveLength(24);
    // 24 ejercicios de tema + examen integrador
    expect(db.select().from(quizzes).all()).toHaveLength(25);
    expect(db.select().from(questions).all()).toHaveLength(24 * 2 + 10);
    expect(db.select().from(glossaryTerms).all()).toHaveLength(course.glossary.length);
    expect(db.select().from(contentMeta).get()?.version).toBe(course.version);
  });

  it('el ejercicio de tema exige todas sus preguntas y el examen final su passMark', async () => {
    await seeder.seedIfNeeded(course);

    expect(db.select().from(quizzes).where(eq(quizzes.id, 101)).get()).toMatchObject({
      kind: 'topic',
      topicId: 101,
      passMark: 2,
    });
    expect(db.select().from(quizzes).where(eq(quizzes.id, FINAL_EXAM_ID)).get()).toMatchObject({
      kind: 'final',
      topicId: null,
      passMark: 8,
    });
  });

  it('guarda el cuerpo de la lección como JSON y las opciones en orden A–D', async () => {
    await seeder.seedIfNeeded(course);

    const row = db.select().from(topics).where(eq(topics.id, 101)).get();
    expect(LessonBodySchema.parse(JSON.parse(row!.content)).example.title).toBe(
      'La papelería de Ana',
    );
    const options = db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, 10101))
      .orderBy(questionOptions.sortOrder)
      .all();
    expect(options.map((o) => o.sortOrder)).toEqual([1, 2, 3, 4]);
    expect(options.filter((o) => o.isCorrect)).toHaveLength(1);
  });

  it('no vuelve a sembrar si la versión no cambió', async () => {
    await seeder.seedIfNeeded(course);

    expect(await seeder.seedIfNeeded(course)).toBe(false);
  });

  it('con una versión mayor actualiza el contenido, reemplaza opciones y conserva el avance', async () => {
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
    db.insert(quizProgress)
      .values({
        userId: 'u1',
        quizId: 101,
        passed: true,
        attempts: 1,
        bestScore: 2,
        passedAt: clock.nowIso(),
      })
      .run();

    const [nivel1, ...rest] = course.levels;
    const [first, ...others] = nivel1.topics;
    const firstQuestion = first.quiz.questions[0];
    const updated: Course = {
      ...course,
      version: course.version + 1,
      levels: [
        {
          ...nivel1,
          topics: [
            {
              ...first,
              title: '¿Qué es la contabilidad? (revisado)',
              quiz: {
                questions: [
                  { ...firstQuestion, options: firstQuestion.options.slice(0, 2) },
                  ...first.quiz.questions.slice(1),
                ],
              },
            },
            ...others,
          ],
        },
        ...rest,
      ],
      glossary: course.glossary.slice(0, 5),
    };

    expect(await seeder.seedIfNeeded(updated)).toBe(true);

    expect(db.select().from(topics).where(eq(topics.id, 101)).get()?.title).toBe(
      '¿Qué es la contabilidad? (revisado)',
    );
    expect(
      db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, firstQuestion.id))
        .all(),
    ).toHaveLength(2);
    expect(db.select().from(glossaryTerms).all()).toHaveLength(5);
    expect(db.select().from(quizProgress).all()).toHaveLength(1);
    expect(db.select().from(contentMeta).get()?.version).toBe(course.version + 1);
  });
});
