import { eq } from 'drizzle-orm';
import { z } from 'zod';

import type { AppDatabase } from '@/core/database/database';
import { leaderboardCache } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { Ranking } from '../../domain/entities/Ranking';
import type { RankingCache } from '../../domain/repositories/RankingRemote';

const EntrySchema = z.object({
  position: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string().nullable(),
  state: z.string(),
  country: z.string(),
  levelsCompleted: z.number(),
  topicsPassed: z.number(),
  isMe: z.boolean(),
});
const RankingSchema = z.object({
  total: z.number(),
  entries: z.array(EntrySchema),
  me: EntrySchema.nullable(),
});

/** Último ranking del usuario en `leaderboard_cache` (una fila por usuario, JSON). */
export class SqliteRankingCache implements RankingCache {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async get(): Promise<{ ranking: Ranking; fetchedAt: string } | null> {
    const row = this.db
      .select({ payload: leaderboardCache.payload, fetchedAt: leaderboardCache.fetchedAt })
      .from(leaderboardCache)
      .where(eq(leaderboardCache.userId, this.session.requireUserId()))
      .get();
    if (!row) return null;
    // Un JSON de otra versión de la app se ignora: es solo una caché
    const parsed = RankingSchema.safeParse(JSON.parse(row.payload));
    return parsed.success ? { ranking: parsed.data, fetchedAt: row.fetchedAt } : null;
  }

  async save(ranking: Ranking, fetchedAt: string): Promise<void> {
    const values = { payload: JSON.stringify(ranking), fetchedAt, updatedAt: fetchedAt };
    this.db
      .insert(leaderboardCache)
      .values({ userId: this.session.requireUserId(), ...values })
      .onConflictDoUpdate({ target: leaderboardCache.userId, set: values })
      .run();
  }
}
