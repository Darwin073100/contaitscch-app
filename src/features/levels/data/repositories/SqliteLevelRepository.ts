import { asc } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels } from '@/core/database/schema';

import type { LevelInfo } from '../../domain/entities/Level';
import type { LevelRepository } from '../../domain/repositories/LevelRepository';

export class SqliteLevelRepository implements LevelRepository {
  constructor(private readonly db: AppDatabase) {}

  async getLevels(): Promise<LevelInfo[]> {
    return this.db
      .select({
        id: levels.id,
        sortOrder: levels.sortOrder,
        title: levels.title,
        description: levels.goal,
      })
      .from(levels)
      .orderBy(asc(levels.sortOrder))
      .all();
  }
}
