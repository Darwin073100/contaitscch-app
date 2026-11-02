import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { topics } from './topic';

export const subtopics = sqliteTable(
  'subtopic',
  {
    /** Inmutable: tema×100 + orden. */
    id: integer('id').primaryKey(),
    topicId: integer('topic_id')
      .notNull()
      .references(() => topics.id),
    title: text('title').notNull(),
    /** Arreglo `blocks` del JSON de contenido, serializado con JSON.stringify. */
    content: text('content').notNull(),
    sortOrder: integer('sort_order').notNull(),
    ...auditColumns,
  },
  (t) => [uniqueIndex('subtopic_topic_sort_order_unique').on(t.topicId, t.sortOrder)],
);
