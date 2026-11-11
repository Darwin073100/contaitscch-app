import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { users } from './user';

// Una fila por usuario: lo que pinta el indicador de sincronización.
export const syncState = sqliteTable('sync_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  /** Generación del avance en la nube; NULL = este teléfono nunca ha sincronizado. */
  generation: integer('generation'),
  lastSyncedAt: text('last_synced_at'),
  /** 'offline' | 'network' | 'invalid_input'; NULL si la última sincronización salió bien. */
  lastError: text('last_error'),
  ...auditColumns,
});
