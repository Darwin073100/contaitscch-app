import { and, asc, eq, sql } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { exams, levels, topicProgress, topics, xpEvents } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { LevelProgress } from '../../domain/entities/Level';
import type { LevelRepository } from '../../domain/repositories/LevelRepository';

export class SqliteLevelRepository implements LevelRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async getProgress(): Promise<LevelProgress[]> {
    const userId = this.session.requireUserId();
    return this.db
      .select({
        id: levels.id,
        name: levels.name,
        sortOrder: levels.sortOrder,
        subtitle: levels.subtitle,
        description: levels.description,
        completedTopics: sql`(SELECT COUNT(*) FROM ${topicProgress} INNER JOIN ${topics} ON ${eq(
          topics.id,
          topicProgress.topicId,
        )} WHERE ${and(eq(topicProgress.userId, userId), eq(topics.levelId, levels.id))})`.mapWith(
          Number,
        ),
        totalTopics: sql`(SELECT COUNT(*) FROM ${topics} WHERE ${eq(
          topics.levelId,
          levels.id,
        )})`.mapWith(Number),
        // Aprobado = existe el xp_event del examen (también cuenta al restaurar desde Supabase)
        examPassed: sql`EXISTS (SELECT 1 FROM ${xpEvents} INNER JOIN ${exams} ON ${eq(
          exams.id,
          xpEvents.examId,
        )} WHERE ${and(eq(xpEvents.userId, userId), eq(exams.levelId, levels.id))})`.mapWith(
          Boolean,
        ),
      })
      .from(levels)
      .orderBy(asc(levels.sortOrder))
      .all();
  }
}
