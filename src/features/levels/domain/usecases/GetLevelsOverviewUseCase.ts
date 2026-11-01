import { err, ok, type Result } from '@/core/result/Result';

import type { LevelsOverview } from '../entities/Level';
import { careerProgress, resolveLevelStatuses } from '../policies/LevelUnlockPolicy';
import type { LevelRepository } from '../repositories/LevelRepository';

export type GetLevelsOverviewError = 'NO_LEVELS';

/** Niveles con su estado, el nivel actual del usuario y el avance de la carrera. */
export class GetLevelsOverviewUseCase {
  constructor(private readonly levels: LevelRepository) {}

  async execute(): Promise<Result<LevelsOverview, GetLevelsOverviewError>> {
    const progress = await this.levels.getProgress();
    const levels = resolveLevelStatuses(progress);
    const currentLevel = levels.filter((l) => l.status !== 'locked').at(-1);
    if (!currentLevel) return err('NO_LEVELS');

    return ok({ levels, currentLevel, career: careerProgress(progress) });
  }
}
