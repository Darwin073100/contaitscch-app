import type { CourseProgress } from '../entities/CourseProgress';
import { buildCourseProgress } from '../policies/CourseProgressPolicy';
import type { CourseProgressReader } from '../repositories/CourseProgressReader';

/** Avance del curso completo: estado de cada tema y nivel, siguiente tema y examen final. */
export class GetCourseProgressUseCase {
  constructor(private readonly progress: CourseProgressReader) {}

  async execute(): Promise<CourseProgress> {
    return buildCourseProgress(await this.progress.getLessonRecords());
  }
}
