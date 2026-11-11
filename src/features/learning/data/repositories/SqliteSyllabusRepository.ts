import { asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { levels, topics } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

import type { SyllabusSource } from '../../domain/entities/Syllabus';
import type { SyllabusRepository } from '../../domain/repositories/SyllabusRepository';
import { LESSON_STEP_TITLES } from '../mappers/lessonStepsMapper';
import { levelCompletedSql, topicPassedSql } from '@/core/database/queries/progressSql';

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
        sortOrder: levels.sortOrder,
        title: levels.title,
        description: levels.goal,
        // Temporal (F3): sin examen por nivel, "aprobado" = sus 4 temas aprobados
        examPassed: levelCompletedSql(userId, levelId),
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
        completed: topicPassedSql(userId),
      })
      .from(topics)
      .where(eq(topics.levelId, levelId))
      .orderBy(asc(topics.sortOrder))
      .all();

    const { examPassed, ...info } = level;
    return {
      level: { ...info, name: `Nivel ${info.sortOrder}` },
      // El tema siempre abre en el paso 1: no se guarda el paso visto
      topics: rows.map((t) => ({
        ...t,
        viewedSubtopics: 0,
        totalSubtopics: LESSON_STEP_TITLES.length,
      })),
      examPassed,
    };
  }
}
