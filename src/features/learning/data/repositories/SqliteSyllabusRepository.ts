import { eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels } from '@/core/database/schema';

import type { SyllabusLevel } from '../../domain/entities/Syllabus';
import type { SyllabusRepository } from '../../domain/repositories/SyllabusRepository';

export class SqliteSyllabusRepository implements SyllabusRepository {
  constructor(private readonly db: AppDatabase) {}

  async findLevel(levelId: number): Promise<SyllabusLevel | null> {
    const level = this.db
      .select({
        id: levels.id,
        sortOrder: levels.sortOrder,
        title: levels.title,
        description: levels.goal,
      })
      .from(levels)
      .where(eq(levels.id, levelId))
      .get();
    return level ?? null;
  }
}
