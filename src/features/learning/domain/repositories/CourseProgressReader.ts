import type { LessonRecord } from '../entities/CourseProgress';

export interface CourseProgressReader {
  /** Todos los temas del curso con el avance del usuario de la sesión. */
  getLessonRecords(): Promise<LessonRecord[]>;
}
