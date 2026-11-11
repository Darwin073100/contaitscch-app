import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { quizzes } from './quiz';

// Solo opción múltiple.
export const questions = sqliteTable(
  'question',
  {
    /** Inmutable: quiz×100 + orden. */
    id: integer('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    sortOrder: integer('sort_order').notNull(),
    statement: text('statement').notNull(),
    /** Se muestra solo cuando el alumno acierta. */
    feedback: text('feedback'),
    ...auditColumns,
  },
  (t) => [uniqueIndex('question_quiz_sort_order_unique').on(t.quizId, t.sortOrder)],
);
