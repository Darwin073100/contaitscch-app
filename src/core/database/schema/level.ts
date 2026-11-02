import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

export const levels = sqliteTable('level', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  /** 1 = Básico, 2 = Intermedio, 3 = Avanzado; define cuál es el "nivel anterior". */
  sortOrder: integer('sort_order').notNull().unique(),
  ...auditColumns,
});
