import { and, eq } from 'drizzle-orm';
import initSqlJs from 'sql.js';

import type { Clock } from '@/core/clock/Clock';

import type { AppDatabase } from './database';
import { migrateDatabase } from './migrate';
import { contentMeta, questionOptions, questions, quizProgress, quizzes, users } from './schema';
import { ContentSeeder } from './seed/ContentSeeder';
import { loadCourse, type Course } from './seed/loadCourse';
import { connectSqlJsDatabase } from './sqlJsDatabase';
import { SqliteUnitOfWork } from './SqliteUnitOfWork';

const clock: Clock = {
  nowIso: () => '2026-11-19T18:00:00.000Z',
  todayLocal: () => '2026-11-19',
};

/** Curso con una pregunta más en el tema 101 y la versión del contenido subida. */
function withExtraQuestion(course: Course): Course {
  const [first, ...restLevels] = course.levels;
  const [topic, ...restTopics] = first.topics;
  const order = topic.quiz.questions.length + 1;
  const questionId = topic.id * 100 + order;
  const extra = {
    id: questionId,
    sortOrder: order,
    statement: '¿Pregunta agregada después?',
    options: [
      { id: questionId * 10 + 1, text: 'Sí', isCorrect: true },
      { id: questionId * 10 + 2, text: 'No', isCorrect: false },
    ],
  };
  return {
    ...course,
    version: course.version + 1,
    levels: [
      {
        ...first,
        topics: [
          { ...topic, quiz: { ...topic.quiz, questions: [...topic.quiz.questions, extra] } },
          ...restTopics,
        ],
      },
      ...restLevels,
    ],
  };
}

/**
 * Base de la versión web (sql.js, spec 10) con el mismo código que Android: migraciones, siembra,
 * transacciones y una actualización del contenido que agrega preguntas sin tocar el avance.
 */
describe('base web con sql.js', () => {
  let SQL: Awaited<ReturnType<typeof initSqlJs>>;

  beforeAll(async () => {
    SQL = await initSqlJs();
  });

  async function preparedDatabase() {
    const client = new SQL.Database();
    const db = connectSqlJsDatabase(client);
    await migrateDatabase(db);
    const seeder = new ContentSeeder(db, new SqliteUnitOfWork(db), clock);
    await seeder.seedIfNeeded(loadCourse());
    return { client, db, seeder };
  }

  function addPassedProgress(db: AppDatabase) {
    db.insert(users)
      .values({
        id: 'u1',
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@prueba.mx',
        country: 'México',
        state: 'Guerrero',
      })
      .run();
    db.insert(quizProgress)
      .values({
        userId: 'u1',
        quizId: 101,
        passed: true,
        bestScore: 2,
        attempts: 1,
        passedAt: clock.nowIso(),
      })
      .run();
  }

  it('aplica las migraciones y siembra el curso', async () => {
    const { db } = await preparedDatabase();

    expect(db.select().from(quizzes).all()).toHaveLength(25);
    expect(db.select().from(contentMeta).get()?.version).toBe(loadCourse().version);
  });

  it('una versión nueva del contenido agrega preguntas y conserva el avance', async () => {
    const { db, seeder } = await preparedDatabase();
    addPassedProgress(db);
    const before = db.select().from(questions).where(eq(questions.quizId, 101)).all().length;

    expect(await seeder.seedIfNeeded(withExtraQuestion(loadCourse()))).toBe(true);

    expect(db.select().from(questions).where(eq(questions.quizId, 101)).all()).toHaveLength(
      before + 1,
    );
    expect(db.select().from(quizzes).where(eq(quizzes.id, 101)).get()?.passMark).toBe(before + 1);
    expect(
      db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, 101 * 100 + before + 1))
        .all(),
    ).toHaveLength(2);
    // Aprobar nunca se deshace: el tema sigue aprobado con su puntaje anterior
    expect(
      db
        .select()
        .from(quizProgress)
        .where(and(eq(quizProgress.userId, 'u1'), eq(quizProgress.quizId, 101)))
        .get(),
    ).toMatchObject({ passed: true, bestScore: 2, attempts: 1 });
  });

  it('la copia guardada (export) se vuelve a abrir completa', async () => {
    const { client, db } = await preparedDatabase();
    addPassedProgress(db);

    const reopened = connectSqlJsDatabase(new SQL.Database(client.export()));
    const seeder = new ContentSeeder(reopened, new SqliteUnitOfWork(reopened), clock);

    expect(await seeder.seedIfNeeded(loadCourse())).toBe(false);
    expect(reopened.select().from(quizProgress).all()).toHaveLength(1);
    expect(reopened.select({ id: users.id }).from(users).where(eq(users.id, 'u1')).get()).toEqual({
      id: 'u1',
    });
  });

  it('una sesión sin usuario no encuentra fila (lo usa el arranque para cerrarla)', async () => {
    const { db } = await preparedDatabase();

    expect(db.select({ id: users.id }).from(users).where(eq(users.id, 'nadie')).get()).toBe(
      undefined,
    );
  });
});
