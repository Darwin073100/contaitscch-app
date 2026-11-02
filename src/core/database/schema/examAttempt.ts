import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { exams } from './exam';
import { users } from './user';

// Historial de intentos; permite reintentar un examen reprobado.
export const examAttempts = sqliteTable(
  'exam_attempt',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    examId: integer('exam_id')
      .notNull()
      .references(() => exams.id),
    /** Porcentaje obtenido, 0 a 100. */
    score: integer('score').notNull(),
    takenAt: text('taken_at').notNull(),
    ...auditColumns,
  },
  (t) => [index('exam_attempt_user_exam_idx').on(t.userId, t.examId)],
);
