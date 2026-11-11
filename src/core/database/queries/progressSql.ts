import { and, eq, sql, type AnyColumn } from 'drizzle-orm';

import { quizProgress, quizzes, topics } from '../schema';

// Fragmentos SQL del avance del usuario. Un tema está aprobado si su ejercicio tiene
// quiz_progress.passed = 1.

/** Ids de los temas que el usuario ya aprobó. */
const passedTopicIdsSql = (userId: string) =>
  sql`SELECT ${quizzes.topicId} FROM ${quizProgress} INNER JOIN ${quizzes} ON ${eq(
    quizzes.id,
    quizProgress.quizId,
  )} WHERE ${and(eq(quizProgress.userId, userId), eq(quizProgress.passed, true))}`;

/** El tema de la fila actual está aprobado (para un SELECT sobre `topic`). */
export const topicPassedSql = (userId: string) =>
  sql`${topics.id} IN (${passedTopicIdsSql(userId)})`.mapWith(Boolean);

// `levelId`: un id o la columna del SELECT exterior (`levels.id`). Se compara con eq(): una
// columna suelta dentro de sql`` en un SELECT de una sola tabla sale sin calificar ("id") y
// dentro de la subconsulta apuntaría a topic.id.
type LevelRef = number | AnyColumn;

/** Temas aprobados de un nivel. */
export const passedTopicsInLevelSql = (userId: string, levelId: LevelRef) =>
  sql`(SELECT COUNT(*) FROM ${topics} WHERE ${and(
    eq(topics.levelId, levelId),
    sql`${topics.id} IN (${passedTopicIdsSql(userId)})`,
  )})`.mapWith(Number);

/** Temas de un nivel. */
export const topicsInLevelSql = (levelId: LevelRef) =>
  sql`(SELECT COUNT(*) FROM ${topics} WHERE ${eq(topics.levelId, levelId)})`.mapWith(Number);

/** Todos los temas del nivel están aprobados (y tiene temas). */
export const levelCompletedSql = (userId: string, levelId: LevelRef) =>
  sql`(${topicsInLevelSql(levelId)} > 0 AND ${passedTopicsInLevelSql(
    userId,
    levelId,
  )} = ${topicsInLevelSql(levelId)})`.mapWith(Boolean);
