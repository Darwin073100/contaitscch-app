import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { topics } from './topic';
import { users } from './user';

// Si existe la fila, el tema está completado.
export const topicProgress = sqliteTable(
  'topic_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    topicId: integer('topic_id')
      .notNull()
      .references(() => topics.id),
    completedAt: text('completed_at').notNull(),
    ...auditColumns,
  },
  (t) => [primaryKey({ columns: [t.userId, t.topicId] })],
);
