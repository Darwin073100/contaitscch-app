import type { LevelInfo } from '../entities/Level';

export interface LevelRepository {
  /** Textos de todos los niveles. */
  getLevels(): Promise<LevelInfo[]>;
}
