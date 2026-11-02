import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { exams } from './exam';
import { topics } from './topic';
import { users } from './user';

// Libro de movimientos de XP (append-only; solo se actualiza synced_at). XP total = SUM(points).
export const xpEvents = sqliteTable(
  'xp_event',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    topicId: integer('topic_id').references(() => topics.id),
    examId: integer('exam_id').references(() => exams.id),
    points: integer('points').notNull(),
    earnedAt: text('earned_at').notNull(),
    /** NULL = pendiente de subir a Supabase (Outbox). */
    syncedAt: text('synced_at'),
    ...auditColumns,
  },
  (t) => [
    // Un tema o un examen dan XP una sola vez por usuario
    uniqueIndex('xp_event_user_topic_unique').on(t.userId, t.topicId),
    uniqueIndex('xp_event_user_exam_unique').on(t.userId, t.examId),
    index('xp_event_pending_idx')
      .on(t.userId)
      .where(sql`${t.syncedAt} IS NULL`),
    check('xp_event_single_source', sql`(${t.topicId} IS NULL) <> (${t.examId} IS NULL)`),
    check('xp_event_positive_points', sql`${t.points} > 0`),
  ],
);
