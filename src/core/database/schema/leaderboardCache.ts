import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { users } from './user';

// Último ranking recibido, para mostrarlo sin red ("Actualizado hace X").
export const leaderboardCache = sqliteTable('leaderboard_cache', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  /** Respuesta de get_ranking en JSON. */
  payload: text('payload').notNull(),
  fetchedAt: text('fetched_at').notNull(),
  ...auditColumns,
});
