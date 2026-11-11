import { err, ok, type Result } from '@/core/result/Result';
import type { CourseProgress, LevelState } from '@/features/learning';

import type { LevelOverviewItem, LevelsOverview, LevelStatus } from '../entities/Level';
import type { LevelRepository } from '../repositories/LevelRepository';

export type GetLevelsOverviewError = 'NO_LEVELS';

/** Lo único que este caso de uso necesita de GetCourseProgressUseCase (learning). */
export type CourseProgressSource = { execute(): Promise<CourseProgress> };

const levelStatus: Record<LevelState, LevelStatus> = {
  done: 'completed',
  current: 'inProgress',
  locked: 'locked',
};

/**
 * Niveles con su estado, el nivel actual del usuario y el avance de la carrera. Las reglas de
 * desbloqueo son las del curso completo (learning): el nivel N se abre al aprobar los temas del N-1.
 */
export class GetLevelsOverviewUseCase {
  constructor(
    private readonly levels: LevelRepository,
    private readonly course: CourseProgressSource,
  ) {}

  async execute(): Promise<Result<LevelsOverview, GetLevelsOverviewError>> {
    const [infos, course] = await Promise.all([this.levels.getLevels(), this.course.execute()]);
    const byId = new Map(course.levels.map((l) => [l.levelId, l]));

    const levels = [...infos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((info): LevelOverviewItem => {
        const progress = byId.get(info.id);
        const total = progress?.totalCount ?? 0;
        const completed = progress?.passedCount ?? 0;
        return {
          ...info,
          completedTopics: completed,
          totalTopics: total,
          // Un nivel sin temas no se puede abrir
          status: progress ? levelStatus[progress.state] : 'locked',
          progress: total > 0 ? completed / total : 0,
        };
      });

    const currentLevel = levels.find((l) => l.id === course.currentLevelId) ?? levels[0];
    if (!currentLevel) return err('NO_LEVELS');

    return ok({
      levels,
      currentLevel,
      career: {
        completedTopics: course.passedCount,
        totalTopics: course.totalCount,
        progress: course.totalCount > 0 ? course.passedCount / course.totalCount : 0,
      },
    });
  }
}
