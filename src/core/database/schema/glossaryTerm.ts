import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

export const glossaryTerms = sqliteTable('glossary_term', {
  term: text('term').primaryKey(),
  definition: text('definition').notNull(),
  ...auditColumns,
});
