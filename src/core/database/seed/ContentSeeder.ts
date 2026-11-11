import { inArray, sql } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import type { Clock } from '@/core/clock/Clock';
import type { UnitOfWork } from '@/core/transaction/UnitOfWork';

import type { AppDatabase } from '../database';
import {
  contentMeta,
  glossaryTerms,
  levels,
  questionOptions,
  questions,
  quizzes,
  topics,
} from '../schema';
import { databaseOf } from '../SqliteUnitOfWork';
import type { LessonBody, QuestionContent } from './courseSchema';
import type { Course } from './loadCourse';

/** Valor que se intentó insertar, para el SET de un upsert. */
const excluded = (column: AnySQLiteColumn) => sql.raw(`excluded.${column.name}`);

/** Los ids del contenido son inmutables y vienen del JSON. */
type QuizRow = typeof quizzes.$inferInsert & { id: number };

/**
 * Copia el contenido del JSON a SQLite cuando `manifest.version` es mayor que la versión sembrada.
 * Niveles, temas, ejercicios y preguntas se actualizan por id (inmutables) y nunca se borran, porque
 * el avance del usuario apunta a ellos. Las opciones de cada pregunta y el glosario se reemplazan.
 */
export class ContentSeeder {
  constructor(
    private readonly db: AppDatabase,
    private readonly uow: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  /** true si sembró; false si el contenido ya estaba al día. */
  async seedIfNeeded(course: Course): Promise<boolean> {
    const current = this.db.select({ version: contentMeta.version }).from(contentMeta).get();
    if (current && current.version >= course.version) return false;

    const now = this.clock.nowIso();
    await this.uow.run(async (tx) => {
      const db = databaseOf(tx);
      upsertLevels(db, course, now);
      upsertQuizzes(db, course, now);
      replaceGlossary(db, course);
      db.insert(contentMeta)
        .values({ id: 1, version: course.version })
        .onConflictDoUpdate({
          target: contentMeta.id,
          set: { version: course.version, updatedAt: now },
        })
        .run();
    });
    return true;
  }
}

function upsertLevels(db: AppDatabase, course: Course, now: string): void {
  db.insert(levels)
    .values(
      course.levels.map(({ level }) => ({
        id: level.id,
        sortOrder: level.id,
        title: level.title,
        goal: level.goal,
      })),
    )
    .onConflictDoUpdate({
      target: levels.id,
      set: {
        sortOrder: excluded(levels.sortOrder),
        title: excluded(levels.title),
        goal: excluded(levels.goal),
        updatedAt: now,
      },
    })
    .run();

  db.insert(topics)
    .values(
      course.levels.flatMap(({ level, topics: levelTopics }) =>
        levelTopics.map((t) => {
          const body: LessonBody = {
            explanation: t.explanation,
            example: t.example,
            keyIdea: t.keyIdea,
            commonError: t.commonError,
            activity: t.activity,
          };
          return {
            id: t.id,
            levelId: level.id,
            sortOrder: t.sortOrder,
            title: t.title,
            objective: t.objective,
            content: JSON.stringify(body),
          };
        }),
      ),
    )
    .onConflictDoUpdate({
      target: topics.id,
      set: {
        levelId: excluded(topics.levelId),
        sortOrder: excluded(topics.sortOrder),
        title: excluded(topics.title),
        objective: excluded(topics.objective),
        content: excluded(topics.content),
        updatedAt: now,
      },
    })
    .run();
}

function upsertQuizzes(db: AppDatabase, course: Course, now: string): void {
  // Ejercicio de cada tema (id = id del tema) y examen integrador
  const sources: { row: QuizRow; questions: QuestionContent[] }[] = [
    ...course.levels.flatMap(({ topics: levelTopics }) =>
      levelTopics.map((t) => ({
        row: {
          id: t.id,
          kind: 'topic' as const,
          topicId: t.id,
          passMark: t.quiz.passMark ?? t.quiz.questions.length,
        },
        questions: t.quiz.questions,
      })),
    ),
    {
      row: {
        id: course.finalExam.id,
        kind: 'final',
        topicId: null,
        passMark: course.finalExam.passMark ?? course.finalExam.questions.length,
      },
      questions: course.finalExam.questions,
    },
  ];

  db.insert(quizzes)
    .values(sources.map((s) => s.row))
    .onConflictDoUpdate({
      target: quizzes.id,
      set: {
        kind: excluded(quizzes.kind),
        topicId: excluded(quizzes.topicId),
        passMark: excluded(quizzes.passMark),
        updatedAt: now,
      },
    })
    .run();

  const allQuestions = sources.flatMap((s) =>
    s.questions.map((q) => ({ quizId: s.row.id, question: q })),
  );
  db.insert(questions)
    .values(
      allQuestions.map(({ quizId, question: q }) => ({
        id: q.id,
        quizId,
        sortOrder: q.sortOrder,
        statement: q.statement,
        feedback: q.feedback ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: questions.id,
      set: {
        quizId: excluded(questions.quizId),
        sortOrder: excluded(questions.sortOrder),
        statement: excluded(questions.statement),
        feedback: excluded(questions.feedback),
        updatedAt: now,
      },
    })
    .run();

  // Reemplazo completo: una opción quitada del JSON no debe seguir contando como correcta
  const questionIds = allQuestions.map(({ question }) => question.id);
  db.delete(questionOptions).where(inArray(questionOptions.questionId, questionIds)).run();
  db.insert(questionOptions)
    .values(
      allQuestions.flatMap(({ question: q }) =>
        q.options.map((o, i) => ({
          id: o.id,
          questionId: q.id,
          sortOrder: i + 1,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      ),
    )
    .run();
}

/** Nadie apunta a los términos: se reemplazan completos. */
function replaceGlossary(db: AppDatabase, course: Course): void {
  db.delete(glossaryTerms).run();
  db.insert(glossaryTerms).values(course.glossary).run();
}
