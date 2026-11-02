import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

// Una sola fila (id = 1): versión del contenido sembrado; se compara con manifest.version.
export const contentMeta = sqliteTable(
  'content_meta',
  {
    id: integer('id').primaryKey(),
    version: integer('version').notNull(),
    ...auditColumns,
  },
  (t) => [check('content_meta_single_row', sql`${t.id} = 1`)],
);
