import { eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import { levels, quizProgress, topics } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { TopicSessionSource } from '../../domain/entities/TopicSession';
import type { TopicProgressRepository } from '../../domain/repositories/TopicProgressRepository';
import type { TopicSessionReader } from '../../domain/repositories/TopicSessionReader';
import { toLessonSteps } from '../mappers/lessonStepsMapper';
import { topicPassedSql } from '@/core/database/queries/progressSql';

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
        level: { id: levels.id, sortOrder: levels.sortOrder },
        topic: { id: topics.id, title: topics.title, sortOrder: topics.sortOrder },
        objective: topics.objective,
        content: topics.content,
        completed: topicPassedSql(userId),
      })
      .from(topics)
      .innerJoin(levels, eq(levels.id, topics.levelId))
      .where(eq(topics.id, topicId))
      .get();
    if (!row) return null;

    return {
      level: { ...row.level, name: `Nivel ${row.level.sortOrder}` },
      topic: row.topic,
      subtopics: toLessonSteps(row.topic.id, row.objective, row.content),
      completed: row.completed,
      // El tema siempre abre en el paso 1
      viewedSubtopics: 0,
    };
  }

  async isCompleted(topicId: number): Promise<boolean | null> {
    const row = this.db
      .select({ completed: topicPassedSql(this.session.requireUserId()) })
      .from(topics)
      .where(eq(topics.id, topicId))
      .get();
    return row ? row.completed : null;
  }

  /**
   * Temporal (refactorización v2): marca aprobado el ejercicio del tema (quiz id = id del tema) al
   * terminar de leerlo. En F4 lo reemplaza SubmitQuiz con la calificación real del ejercicio.
   */
  async markCompleted(topicId: number): Promise<void> {
    const userId = this.session.requireUserId();
    const now = this.clock.nowIso();
    this.db
      .insert(quizProgress)
      .values({
        userId,
        quizId: topicId,
        passed: true,
        attempts: 1,
        passedAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();
  }
}
