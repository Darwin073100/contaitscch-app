// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import { SystemClock, type Clock } from '@/core/clock/Clock';
import { PreviewStatsRepository } from '@/features/gamification/data/repositories/PreviewStatsRepository';
import { GetUserStatsUseCase } from '@/features/gamification/domain/usecases/GetUserStatsUseCase';
import { PreviewLearningStore } from '@/features/learning/data/preview/PreviewLearningStore';
import { PreviewSyllabusRepository } from '@/features/learning/data/repositories/PreviewSyllabusRepository';
import { PreviewTopicRepository } from '@/features/learning/data/repositories/PreviewTopicRepository';
import { CompleteTopicUseCase } from '@/features/learning/domain/usecases/CompleteTopicUseCase';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';
import { GetTopicSessionUseCase } from '@/features/learning/domain/usecases/GetTopicSessionUseCase';
import { PreviewLevelRepository } from '@/features/levels/data/repositories/PreviewLevelRepository';
import { GetLevelsOverviewUseCase } from '@/features/levels/domain/usecases/GetLevelsOverviewUseCase';

export type Container = {
  clock: Clock;
  learning: {
    getSyllabus: GetSyllabusUseCase;
    getTopicSession: GetTopicSessionUseCase;
    completeTopic: CompleteTopicUseCase;
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
  const learningStore = new PreviewLearningStore();
  const syllabi = new PreviewSyllabusRepository(learningStore);
  const topics = new PreviewTopicRepository(learningStore);
  const levels = new PreviewLevelRepository();
  const stats = new PreviewStatsRepository(clock);

  return {
    clock,
    learning: {
      getSyllabus: new GetSyllabusUseCase(syllabi),
      getTopicSession: new GetTopicSessionUseCase(topics),
      completeTopic: new CompleteTopicUseCase(topics),
    },
    levels: {
      getLevelsOverview: new GetLevelsOverviewUseCase(levels),
    },
    gamification: {
      getUserStats: new GetUserStatsUseCase(stats, stats, clock),
    },
  };
}
