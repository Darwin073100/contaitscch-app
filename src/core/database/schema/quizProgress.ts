import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { nowIsoSql } from './columns';
import { quizzes } from './quiz';
import { users } from './user';

// Avance del usuario en cada ejercicio (y en el examen final). Se actualiza con la regla de fusión:
// aprobado nunca vuelve a false, best_score y attempts toman el mayor, passed_at el más antiguo.
export const quizProgress = sqliteTable(
  'quiz_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    passed: integer('passed', { mode: 'boolean' }).notNull().default(false),
    bestScore: integer('best_score').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    /** Primera vez que aprobó. */
    passedAt: text('passed_at'),
    /** = updated_at cuando la nube ya tiene esta versión; si no, la fila está pendiente. */
    syncedAt: text('synced_at'),
    createdAt: text('created_at').notNull().default(nowIsoSql),
    /** Clock.nowIso() en cada cambio: con synced_at decide si falta subir la fila. */
    updatedAt: text('updated_at').notNull().default(nowIsoSql),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.quizId] }),
    index('quiz_progress_pending_idx')
      .on(t.userId)
      .where(sql`${t.syncedAt} IS NULL OR ${t.syncedAt} <> ${t.updatedAt}`),
    check('quiz_progress_counts', sql`${t.bestScore} >= 0 AND ${t.attempts} >= 0`),
    check(
      'quiz_progress_passed',
      sql`${t.passed} = 0 OR (${t.passedAt} IS NOT NULL AND ${t.attempts} > 0)`,
    ),
  ],
);
