import { sql } from 'drizzle-orm';
import { index, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { users } from './user';

// Base de la racha (append-only; solo se actualiza synced_at).
export const dailyActivity = sqliteTable(
  'daily_activity',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    /** Día LOCAL del usuario 'YYYY-MM-DD' (Clock.todayLocal()), nunca CURRENT_TIMESTAMP. */
    activityDate: text('activity_date').notNull(),
    /** NULL = pendiente de subir a Supabase (Outbox). */
    syncedAt: text('synced_at'),
    ...auditColumns,
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.activityDate] }),
    index('daily_activity_pending_idx')
      .on(t.userId)
      .where(sql`${t.syncedAt} IS NULL`),
  ],
);
