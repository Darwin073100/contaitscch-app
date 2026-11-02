import { and, eq, gte, lt, sql } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { dailyActivity, xpEvents } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { ActivityReader, XpReader } from '../../domain/repositories/StatsReaders';

/** Inicio y fin (exclusivo) en ISO UTC de un día local 'YYYY-MM-DD', para comparar con earned_at. */
function localDayRange(day: string): { start: string; end: string } {
  const [year, month, date] = day.split('-').map(Number);
  return {
    start: new Date(year, month - 1, date).toISOString(),
    end: new Date(year, month - 1, date + 1).toISOString(),
  };
}

export class SqliteStatsRepository implements XpReader, ActivityReader {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async getTotal(): Promise<number> {
    return this.sumPoints(eq(xpEvents.userId, this.session.requireUserId()));
  }

  async getEarnedOn(day: string): Promise<number> {
    const { start, end } = localDayRange(day);
    return this.sumPoints(
      and(
        eq(xpEvents.userId, this.session.requireUserId()),
        gte(xpEvents.earnedAt, start),
        lt(xpEvents.earnedAt, end),
      ),
    );
  }

  async getActiveDays(): Promise<string[]> {
    return this.db
      .select({ day: dailyActivity.activityDate })
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, this.session.requireUserId()))
      .all()
      .map((row) => row.day);
  }

  private sumPoints(where: ReturnType<typeof and>): number {
    const row = this.db
      .select({ total: sql`COALESCE(SUM(${xpEvents.points}), 0)`.mapWith(Number) })
      .from(xpEvents)
      .where(where)
      .get();
    return row?.total ?? 0;
  }
}
