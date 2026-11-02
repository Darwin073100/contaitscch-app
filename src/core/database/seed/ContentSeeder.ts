import { inArray, sql } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import type { Clock } from '@/core/clock/Clock';
import type { UnitOfWork } from '@/core/transaction/UnitOfWork';

import type { AppDatabase } from '../database';
import {
  contentMeta,
  exams,
  levels,
  questionOptions,
  questions,
  subtopics,
  topics,
} from '../schema';
import { databaseOf } from '../SqliteUnitOfWork';
import type { LevelContent } from './contentSchema';
import type { Course } from './loadCourse';

/** Valor que se intentó insertar, para el SET de un upsert. */
const excluded = (column: AnySQLiteColumn) => sql.raw(`excluded.${column.name}`);

/**
 * Copia el contenido del JSON a SQLite cuando `manifest.version` es mayor que la versión sembrada.
 * Temas, subtemas, examen y preguntas se actualizan por id (inmutables) y nunca se borran, porque
 * el progreso del usuario apunta a ellos. Las opciones de cada pregunta se reemplazan completas.
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
      for (const level of course.levels) upsertLevel(db, level, now);
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

function upsertLevel(db: AppDatabase, content: LevelContent, now: string): void {
  const { level, exam } = content;

  db.insert(levels)
    .values(level)
    .onConflictDoUpdate({
      target: levels.id,
      set: { name: excluded(levels.name), sortOrder: excluded(levels.sortOrder), updatedAt: now },
    })
    .run();

  db.insert(topics)
    .values(
      content.topics.map((t) => ({
        id: t.id,
        levelId: level.id,
        title: t.title,
        sortOrder: t.sortOrder,
      })),
    )
    .onConflictDoUpdate({
      target: topics.id,
      set: {
        levelId: excluded(topics.levelId),
        title: excluded(topics.title),
        sortOrder: excluded(topics.sortOrder),
        updatedAt: now,
      },
    })
    .run();

  db.insert(subtopics)
    .values(
      content.topics.flatMap((t) =>
        t.subtopics.map((s) => ({
          id: s.id,
          topicId: t.id,
          title: s.title,
          content: JSON.stringify(s.blocks),
          sortOrder: s.sortOrder,
        })),
      ),
    )
    .onConflictDoUpdate({
      target: subtopics.id,
      set: {
        topicId: excluded(subtopics.topicId),
        title: excluded(subtopics.title),
        content: excluded(subtopics.content),
        sortOrder: excluded(subtopics.sortOrder),
        updatedAt: now,
      },
    })
    .run();

  db.insert(exams)
    .values({
      id: exam.id,
      levelId: level.id,
      xpReward: exam.xpReward,
      passingScore: exam.passingScore,
    })
    .onConflictDoUpdate({
      target: exams.id,
      set: {
        levelId: excluded(exams.levelId),
        xpReward: excluded(exams.xpReward),
        passingScore: excluded(exams.passingScore),
        updatedAt: now,
      },
    })
    .run();

  db.insert(questions)
    .values(
      exam.questions.map((q) => ({
        id: q.id,
        examId: exam.id,
        type: q.type,
        statement: q.statement,
        sortOrder: q.sortOrder,
        feedback: q.feedback ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: questions.id,
      set: {
        examId: excluded(questions.examId),
        type: excluded(questions.type),
        statement: excluded(questions.statement),
        sortOrder: excluded(questions.sortOrder),
        feedback: excluded(questions.feedback),
        updatedAt: now,
      },
    })
    .run();

  // Reemplazo completo: una opción quitada del JSON no debe seguir contando como correcta
  const questionIds = exam.questions.map((q) => q.id);
  db.delete(questionOptions).where(inArray(questionOptions.questionId, questionIds)).run();
  db.insert(questionOptions)
    .values(
      exam.questions.flatMap((q) =>
        q.options.map((o) => ({
          id: o.id,
          questionId: q.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      ),
    )
    .run();
}
