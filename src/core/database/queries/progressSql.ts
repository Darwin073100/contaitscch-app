import { and, eq, sql } from 'drizzle-orm';

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
