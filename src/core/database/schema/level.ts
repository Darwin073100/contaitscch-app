import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

export const levels = sqliteTable('level', {
  /** Inmutable: 1..6. */
  id: integer('id').primaryKey(),
  /** Define cuál es el "nivel anterior". */
  sortOrder: integer('sort_order').notNull().unique(),
  /** "Fundamentos: qué es la contabilidad y para qué sirve". */
  title: text('title').notNull(),
  /** "Al terminar este nivel el alumno…". */
  goal: text('goal').notNull(),
  ...auditColumns,
});
