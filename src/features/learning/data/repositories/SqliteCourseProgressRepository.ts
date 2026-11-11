import { and, asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels, quizProgress, quizzes, topics } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { LessonRecord } from '../../domain/entities/CourseProgress';
import type { CourseProgressReader } from '../../domain/repositories/CourseProgressReader';

export class SqliteCourseProgressRepository implements CourseProgressReader {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async getLessonRecords(): Promise<LessonRecord[]> {
    const userId = this.session.requireUserId();
    const rows = this.db
      .select({
        topicId: topics.id,
        levelId: topics.levelId,
        levelOrder: levels.sortOrder,
        order: topics.sortOrder,
        title: topics.title,
        passed: quizProgress.passed,
        attempts: quizProgress.attempts,
        bestScore: quizProgress.bestScore,
      })
      .from(topics)
      .innerJoin(levels, eq(levels.id, topics.levelId))
      .innerJoin(quizzes, eq(quizzes.topicId, topics.id))
      .leftJoin(
        quizProgress,
        and(eq(quizProgress.quizId, quizzes.id), eq(quizProgress.userId, userId)),
      )
      .orderBy(asc(levels.sortOrder), asc(topics.sortOrder))
      .all();

    // Sin fila de avance = tema nunca intentado
    return rows.map((r) => ({
      ...r,
      passed: r.passed ?? false,
      attempts: r.attempts ?? 0,
      bestScore: r.bestScore ?? 0,
    }));
  }
}
