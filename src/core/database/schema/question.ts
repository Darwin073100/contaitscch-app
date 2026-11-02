import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { exams } from './exam';

export const questions = sqliteTable(
  'question',
  {
    /** Inmutable: examen×1000 + orden. */
    id: integer('id').primaryKey(),
    examId: integer('exam_id')
      .notNull()
      .references(() => exams.id),
    type: text('type', { enum: ['multiple_choice', 'complementary'] }).notNull(),
    statement: text('statement').notNull(),
    sortOrder: integer('sort_order').notNull(),
    /** Mensaje opcional al responder (ej. "¡Excelente!"). */
    feedback: text('feedback'),
    ...auditColumns,
  },
  (t) => [uniqueIndex('question_exam_sort_order_unique').on(t.examId, t.sortOrder)],
);
