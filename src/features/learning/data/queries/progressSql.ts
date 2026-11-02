import { and, eq, sql } from 'drizzle-orm';

import {
  exams,
  subtopicProgress,
  subtopics,
  topicProgress,
  topics,
  xpEvents,
} from '@/core/database/schema';

// Fragmentos SQL del progreso del usuario, para usar dentro de un SELECT sobre `topic` o `subtopic`.

/** El tema de la fila actual está completado (existe en topic_progress). */
export const topicCompletedSql = (userId: string) =>
  sql`EXISTS (SELECT 1 FROM ${topicProgress} WHERE ${and(
    eq(topicProgress.userId, userId),
    eq(topicProgress.topicId, topics.id),
  )})`.mapWith(Boolean);

/** Subtemas vistos del tema de la fila actual. */
export const viewedSubtopicsSql = (userId: string) =>
  sql`(SELECT COUNT(*) FROM ${subtopicProgress} INNER JOIN ${subtopics} ON ${eq(
    subtopics.id,
    subtopicProgress.subtopicId,
  )} WHERE ${and(eq(subtopicProgress.userId, userId), eq(subtopics.topicId, topics.id))})`.mapWith(
    Number,
  );

/** Total de subtemas del tema de la fila actual. */
export const totalSubtopicsSql = () =>
  sql`(SELECT COUNT(*) FROM ${subtopics} WHERE ${eq(subtopics.topicId, topics.id)})`.mapWith(
    Number,
  );

/** El subtema de la fila actual ya fue visto. */
export const subtopicViewedSql = (userId: string) =>
  sql`EXISTS (SELECT 1 FROM ${subtopicProgress} WHERE ${and(
    eq(subtopicProgress.userId, userId),
    eq(subtopicProgress.subtopicId, subtopics.id),
  )})`.mapWith(Boolean);

/** Aprobó el examen del nivel: existe su xp_event (así también cuenta al restaurar desde Supabase). */
export const examPassedSql = (userId: string, levelId: number) =>
  sql`EXISTS (SELECT 1 FROM ${xpEvents} INNER JOIN ${exams} ON ${eq(
    exams.id,
    xpEvents.examId,
  )} WHERE ${and(eq(xpEvents.userId, userId), eq(exams.levelId, levelId))})`.mapWith(Boolean);
