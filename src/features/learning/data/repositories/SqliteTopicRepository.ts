import { asc, eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import { levels, subtopics, topicProgress, topics } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { TopicSessionSource } from '../../domain/entities/TopicSession';
import type { TopicProgressRepository } from '../../domain/repositories/TopicProgressRepository';
import type { TopicSessionReader } from '../../domain/repositories/TopicSessionReader';
import { toContentBlocks } from '../mappers/blocksMapper';
import { subtopicViewedSql, topicCompletedSql } from '../queries/progressSql';

export class SqliteTopicRepository implements TopicSessionReader, TopicProgressRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
    private readonly clock: Clock,
  ) {}

  async findSession(topicId: number): Promise<TopicSessionSource | null> {
    const userId = this.session.requireUserId();
    const row = this.db
      .select({
        level: { id: levels.id, name: levels.name, sortOrder: levels.sortOrder },
        topic: { id: topics.id, title: topics.title, sortOrder: topics.sortOrder },
        completed: topicCompletedSql(userId),
      })
      .from(topics)
      .innerJoin(levels, eq(levels.id, topics.levelId))
      .where(eq(topics.id, topicId))
      .get();
    if (!row) return null;

    const rows = this.db
      .select({
        id: subtopics.id,
        title: subtopics.title,
        sortOrder: subtopics.sortOrder,
        content: subtopics.content,
        viewed: subtopicViewedSql(userId),
      })
      .from(subtopics)
      .where(eq(subtopics.topicId, topicId))
      .orderBy(asc(subtopics.sortOrder))
      .all();

    return {
      ...row,
      subtopics: rows.map(({ content, viewed: _viewed, ...subtopic }) => ({
        ...subtopic,
        blocks: toContentBlocks(content),
      })),
      viewedSubtopics: rows.filter((s) => s.viewed).length,
    };
  }

  async isCompleted(topicId: number): Promise<boolean | null> {
    const row = this.db
      .select({ completed: topicCompletedSql(this.session.requireUserId()) })
      .from(topics)
      .where(eq(topics.id, topicId))
      .get();
    return row ? row.completed : null;
  }

  async markCompleted(topicId: number): Promise<void> {
    this.db
      .insert(topicProgress)
      .values({
        userId: this.session.requireUserId(),
        topicId,
        completedAt: this.clock.nowIso(),
      })
      .onConflictDoNothing()
      .run();
  }
}
