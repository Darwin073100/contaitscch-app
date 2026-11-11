import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { topics } from './topic';

// Ejercicio de cada tema (id = id del tema) y examen integrador (id = 900).
export const quizzes = sqliteTable(
  'quiz',
  {
    id: integer('id').primaryKey(),
    kind: text('kind', { enum: ['topic', 'final'] }).notNull(),
    topicId: integer('topic_id')
      .unique()
      .references(() => topics.id),
    /** Aciertos mínimos para aprobar. */
    passMark: integer('pass_mark').notNull(),
    ...auditColumns,
  },
  (t) => [
    check('quiz_topic_matches_kind', sql`(${t.kind} = 'topic') = (${t.topicId} IS NOT NULL)`),
    check('quiz_pass_mark_positive', sql`${t.passMark} > 0`),
  ],
);
