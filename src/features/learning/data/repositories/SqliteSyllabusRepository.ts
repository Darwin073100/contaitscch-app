import { asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels, topics } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { SyllabusSource } from '../../domain/entities/Syllabus';
import type { SyllabusRepository } from '../../domain/repositories/SyllabusRepository';
import {
  examPassedSql,
  topicCompletedSql,
  totalSubtopicsSql,
  viewedSubtopicsSql,
} from '../queries/progressSql';

export class SqliteSyllabusRepository implements SyllabusRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async findByLevel(levelId: number): Promise<SyllabusSource | null> {
    const userId = this.session.requireUserId();
    const level = this.db
      .select({
        id: levels.id,
        name: levels.name,
        sortOrder: levels.sortOrder,
        title: levels.title,
        description: levels.tagline,
        examPassed: examPassedSql(userId, levelId),
      })
      .from(levels)
      .where(eq(levels.id, levelId))
      .get();
    if (!level) return null;

    const rows = this.db
      .select({
        id: topics.id,
        title: topics.title,
        sortOrder: topics.sortOrder,
        completed: topicCompletedSql(userId),
        viewedSubtopics: viewedSubtopicsSql(userId),
        totalSubtopics: totalSubtopicsSql(),
      })
      .from(topics)
      .where(eq(topics.levelId, levelId))
      .orderBy(asc(topics.sortOrder))
      .all();

    const { examPassed, ...info } = level;
    return { level: info, topics: rows, examPassed };
  }
}
