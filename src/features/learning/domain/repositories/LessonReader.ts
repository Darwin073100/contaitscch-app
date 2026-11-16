import type { LessonSource } from '../entities/Lesson';

export interface LessonReader {
  /** Contenido del tema y datos de su ejercicio; null si el tema no existe. */
  findLesson(topicId: number): Promise<LessonSource | null>;
}
