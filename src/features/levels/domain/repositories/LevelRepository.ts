import type { LevelProgress } from '../entities/Level';

export interface LevelRepository {
  /** Todos los niveles con el progreso del usuario. */
  getProgress(): Promise<LevelProgress[]>;
}
