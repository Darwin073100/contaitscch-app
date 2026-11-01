import type { SyllabusSource } from '../entities/Syllabus';

export interface SyllabusRepository {
  /** Temas del nivel con el progreso del usuario; null si el nivel no existe. */
  findByLevel(levelId: number): Promise<SyllabusSource | null>;
}
