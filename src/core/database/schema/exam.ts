import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';
import { levels } from './level';

export const exams = sqliteTable('exam', {
  /** Inmutable: igual al id del nivel. */
  id: integer('id').primaryKey(),
  levelId: integer('level_id')
    .notNull()
    .unique()
    .references(() => levels.id),
  xpReward: integer('xp_reward').notNull().default(100),
  /** Porcentaje mínimo para aprobar (score >= passing_score). */
  passingScore: integer('passing_score').notNull().default(70),
  ...auditColumns,
});
