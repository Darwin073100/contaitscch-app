import { count, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels, questions, quizzes, topics } from '@/core/database/schema';
import { LessonBodySchema } from '@/core/database/seed/courseSchema';

import type { LessonSource } from '../../domain/entities/Lesson';
import type { LessonReader } from '../../domain/repositories/LessonReader';

export class SqliteLessonRepository implements LessonReader {
  constructor(private readonly db: AppDatabase) {}

  async findLesson(topicId: number): Promise<LessonSource | null> {
    const row = this.db
      .select({
        levelId: levels.id,
        levelOrder: levels.sortOrder,
        topicId: topics.id,
        title: topics.title,
        order: topics.sortOrder,
        objective: topics.objective,
        content: topics.content,
        passMark: quizzes.passMark,
        questionCount: count(questions.id),
      })
      .from(topics)
      .innerJoin(levels, eq(levels.id, topics.levelId))
      .innerJoin(quizzes, eq(quizzes.topicId, topics.id))
      .leftJoin(questions, eq(questions.quizId, quizzes.id))
      .where(eq(topics.id, topicId))
      .groupBy(topics.id)
      .get();
    if (!row) return null;

    return {
      level: { id: row.levelId, order: row.levelOrder },
      topic: { id: row.topicId, title: row.title, order: row.order },
      objective: row.objective,
      // Se valida otra vez por si la fila no vino del ContentSeeder
      body: LessonBodySchema.parse(JSON.parse(row.content)),
      quiz: { questionCount: row.questionCount, passMark: row.passMark },
    };
  }
}
