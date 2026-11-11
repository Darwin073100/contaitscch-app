import { err, ok, type Result } from '@/core/result/Result';

import type { LessonState } from '../entities/CourseProgress';
import type { Syllabus, SyllabusTopic, TopicStatus } from '../entities/Syllabus';
import { buildCourseProgress } from '../policies/CourseProgressPolicy';
import type { CourseProgressReader } from '../repositories/CourseProgressReader';
import type { SyllabusRepository } from '../repositories/SyllabusRepository';

export type GetSyllabusError = 'LEVEL_NOT_FOUND';

const topicStatus: Record<LessonState, TopicStatus> = {
  done: 'completed',
  current: 'active',
  retry: 'active',
  locked: 'locked',
};

/** Temario de un nivel con el estado de cada tema (mapa de la pestaña Aprender). */
export class GetSyllabusUseCase {
  constructor(
    private readonly syllabi: SyllabusRepository,
    private readonly progress: CourseProgressReader,
  ) {}

  async execute({ levelId }: { levelId: number }): Promise<Result<Syllabus, GetSyllabusError>> {
    const level = await this.syllabi.findLevel(levelId);
    if (!level) return err('LEVEL_NOT_FOUND');

    // El desbloqueo depende de todo el curso (el primer tema de un nivel, del último del anterior)
    const course = buildCourseProgress(await this.progress.getLessonRecords());
    const topics = course.lessons
      .filter((l) => l.levelId === levelId)
      .map((l): SyllabusTopic => ({
        id: l.topicId,
        title: l.title,
        sortOrder: l.order,
        status: topicStatus[l.state],
        retry: l.state === 'retry',
      }));
    const completedTopics = topics.filter((t) => t.status === 'completed').length;

    return ok({
      level,
      topics,
      completedTopics,
      totalTopics: topics.length,
      activeTopic: topics.find((t) => t.status === 'active') ?? null,
      examStatus: topics.length > 0 && completedTopics === topics.length ? 'passed' : 'locked',
    });
  }
}
