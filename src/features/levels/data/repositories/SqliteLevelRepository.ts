import { asc } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { LevelProgress } from '../../domain/entities/Level';
import type { LevelRepository } from '../../domain/repositories/LevelRepository';
import {
  levelCompletedSql,
  passedTopicsInLevelSql,
  topicsInLevelSql,
} from '@/core/database/queries/progressSql';

export class SqliteLevelRepository implements LevelRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async getProgress(): Promise<LevelProgress[]> {
    const userId = this.session.requireUserId();
    const rows = this.db
      .select({
        id: levels.id,
        sortOrder: levels.sortOrder,
        subtitle: levels.title,
        description: levels.goal,
        completedTopics: passedTopicsInLevelSql(userId, levels.id),
        totalTopics: topicsInLevelSql(levels.id),
        // Temporal (F3): sin examen por nivel, "aprobado" = sus 4 temas aprobados
        examPassed: levelCompletedSql(userId, levels.id),
      })
      .from(levels)
      .orderBy(asc(levels.sortOrder))
      .all();
    return rows.map((l) => ({ ...l, name: `Nivel ${l.sortOrder}` }));
  }
}
