import type { SyllabusLevel } from '../entities/Syllabus';

export interface SyllabusRepository {
  /** Textos del nivel; null si no existe. */
  findLevel(levelId: number): Promise<SyllabusLevel | null>;
}
