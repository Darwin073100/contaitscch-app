// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import { SystemClock, type Clock } from '@/core/clock/Clock';
import { PreviewStatsRepository } from '@/features/gamification/data/repositories/PreviewStatsRepository';
import { GetUserStatsUseCase } from '@/features/gamification/domain/usecases/GetUserStatsUseCase';
import { PreviewSyllabusRepository } from '@/features/learning/data/repositories/PreviewSyllabusRepository';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';
import { PreviewLevelRepository } from '@/features/levels/data/repositories/PreviewLevelRepository';
import { GetLevelsOverviewUseCase } from '@/features/levels/domain/usecases/GetLevelsOverviewUseCase';

export type Container = {
  clock: Clock;
  learning: {
    getSyllabus: GetSyllabusUseCase;
  };
  levels: {
    getLevelsOverview: GetLevelsOverviewUseCase;
  };
  gamification: {
    getUserStats: GetUserStatsUseCase;
  };
};

export function createContainer(): Container {
  const clock = new SystemClock();
  const syllabi = new PreviewSyllabusRepository();
  const levels = new PreviewLevelRepository();
  const stats = new PreviewStatsRepository(clock);

  return {
    clock,
    learning: {
      getSyllabus: new GetSyllabusUseCase(syllabi),
    },
    levels: {
      getLevelsOverview: new GetLevelsOverviewUseCase(levels),
    },
    gamification: {
      getUserStats: new GetUserStatsUseCase(stats, stats, clock),
    },
  };
}
