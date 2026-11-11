import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { levels } from './level';

export const topics = sqliteTable(
  'topic',
  {
    /** Inmutable: nivel×100 + orden. */
    id: integer('id').primaryKey(),
    levelId: integer('level_id')
      .notNull()
      .references(() => levels.id),
    /** 1..4 dentro del nivel. */
    sortOrder: integer('sort_order').notNull(),
    title: text('title').notNull(),
    objective: text('objective').notNull(),
    /** `LessonBody` serializado: explicación, ejemplo, idea clave, error común y actividad. */
    content: text('content').notNull(),
    ...auditColumns,
  },
  (t) => [uniqueIndex('topic_level_sort_order_unique').on(t.levelId, t.sortOrder)],
);
