// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import type { SessionStore } from '@/core/session/SessionStore';
import { SqliteStatsRepository } from '@/features/gamification/data/repositories/SqliteStatsRepository';
import { GetUserStatsUseCase } from '@/features/gamification/domain/usecases/GetUserStatsUseCase';
import { SqliteSyllabusRepository } from '@/features/learning/data/repositories/SqliteSyllabusRepository';
import { SqliteTopicRepository } from '@/features/learning/data/repositories/SqliteTopicRepository';
import { CompleteTopicUseCase } from '@/features/learning/domain/usecases/CompleteTopicUseCase';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';
import { GetTopicSessionUseCase } from '@/features/learning/domain/usecases/GetTopicSessionUseCase';
import { SqliteLevelRepository } from '@/features/levels/data/repositories/SqliteLevelRepository';
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

/** Infraestructura ya lista (base migrada y sembrada, sesión resuelta); la arma bootstrap.ts. */
export type ContainerDeps = {
  db: AppDatabase;
  session: SessionStore;
  clock: Clock;
};

export function createContainer({ db, session, clock }: ContainerDeps): Container {
  const syllabi = new SqliteSyllabusRepository(db, session);
  const topics = new SqliteTopicRepository(db, session, clock);
  const levels = new SqliteLevelRepository(db, session);
  const stats = new SqliteStatsRepository(db, session);

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
