import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { questions } from './question';

export const questionOptions = sqliteTable('question_option', {
  id: integer('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id),
  /** Opción (opción múltiple) o respuesta aceptada (complementaria). */
  text: text('text').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
  ...auditColumns,
});
