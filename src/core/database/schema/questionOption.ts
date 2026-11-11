import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { questions } from './question';

export const questionOptions = sqliteTable(
  'question_option',
  {
    /** Inmutable: pregunta×10 + posición. */
    id: integer('id').primaryKey(),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id),
    /** Posición 1..4: letras A–D. */
    sortOrder: integer('sort_order').notNull(),
    text: text('text').notNull(),
    isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
    ...auditColumns,
  },
  (t) => [uniqueIndex('question_option_question_sort_order_unique').on(t.questionId, t.sortOrder)],
);
