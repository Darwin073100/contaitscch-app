import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { subtopics } from './subtopic';
import { users } from './user';

// Subtemas vistos: el tema se retoma en el paso donde se quedó ("2/3" en el mapa).
export const subtopicProgress = sqliteTable(
  'subtopic_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    subtopicId: integer('subtopic_id')
      .notNull()
      .references(() => subtopics.id),
    viewedAt: text('viewed_at').notNull(),
    ...auditColumns,
  },
  (t) => [primaryKey({ columns: [t.userId, t.subtopicId] })],
);
