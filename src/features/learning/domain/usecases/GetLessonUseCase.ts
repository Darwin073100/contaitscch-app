import { err, ok, type Result } from '@/core/result/Result';

import type { Lesson } from '../entities/Lesson';
import { buildCourseProgress } from '../policies/CourseProgressPolicy';
import type { CourseProgressReader } from '../repositories/CourseProgressReader';
import type { LessonReader } from '../repositories/LessonReader';

export type GetLessonError = 'LESSON_NOT_FOUND' | 'LESSON_LOCKED';

/** Lección de un tema desbloqueado, con si ya se aprobó o se está retomando. */
export class GetLessonUseCase {
  constructor(
    private readonly lessons: LessonReader,
    private readonly progress: CourseProgressReader,
  ) {}

  async execute({ topicId }: { topicId: number }): Promise<Result<Lesson, GetLessonError>> {
    const lesson = await this.lessons.findLesson(topicId);
    if (!lesson) return err('LESSON_NOT_FOUND');

    const state = buildCourseProgress(await this.progress.getLessonRecords()).lessons.find(
      (l) => l.topicId === topicId,
    )?.state;
    if (!state || state === 'locked') return err('LESSON_LOCKED');

    return ok({ ...lesson, passed: state === 'done', retake: state === 'retry' });
  }
}
