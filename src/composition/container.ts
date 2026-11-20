// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import type { Clock } from '@/core/clock/Clock';
import { RandomShuffler, type Shuffler } from '@/core/random/Shuffler';
import type { Connectivity } from '@/core/connectivity/Connectivity';
import type { AppDatabase } from '@/core/database/database';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';
import { InMemoryDomainEventBus, type DomainEventBus } from '@/core/events/DomainEventBus';
import type { RemoteClient } from '@/core/network/RpcClient';
import type { SessionManager } from '@/core/session/SessionStore';
import { Pbkdf2PasswordHasher } from '@/features/auth/data/crypto/Pbkdf2PasswordHasher';
import { SupabaseAuthRemoteDataSource } from '@/features/auth/data/datasources/SupabaseAuthRemoteDataSource';
import { SqliteLocalUserRepository } from '@/features/auth/data/repositories/SqliteLocalUserRepository';
import { GetCurrentUserUseCase } from '@/features/auth/domain/usecases/GetCurrentUserUseCase';
import { LoginUseCase } from '@/features/auth/domain/usecases/LoginUseCase';
import { LogoutUseCase } from '@/features/auth/domain/usecases/LogoutUseCase';
import { RegisterUserUseCase } from '@/features/auth/domain/usecases/RegisterUserUseCase';
import { RequestVerificationCodeUseCase } from '@/features/auth/domain/usecases/RequestVerificationCodeUseCase';
import { VerifyEmailCodeUseCase } from '@/features/auth/domain/usecases/VerifyEmailCodeUseCase';
import { SqliteGlossaryRepository } from '@/features/glossary/data/repositories/SqliteGlossaryRepository';
import { GetGlossaryUseCase } from '@/features/glossary/domain/usecases/GetGlossaryUseCase';
import { SqliteCourseProgressRepository } from '@/features/learning/data/repositories/SqliteCourseProgressRepository';
import { SqliteSyllabusRepository } from '@/features/learning/data/repositories/SqliteSyllabusRepository';
import { SqliteLessonRepository } from '@/features/learning/data/repositories/SqliteLessonRepository';
import { GetCourseProgressUseCase } from '@/features/learning/domain/usecases/GetCourseProgressUseCase';
import { GetLessonUseCase } from '@/features/learning/domain/usecases/GetLessonUseCase';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';
import { SqliteLevelRepository } from '@/features/levels/data/repositories/SqliteLevelRepository';
import { SupabaseRankingRemoteDataSource } from '@/features/leaderboard/data/datasources/SupabaseRankingRemoteDataSource';
import { SqliteRankingCache } from '@/features/leaderboard/data/repositories/SqliteRankingCache';
import { SyncAndFetchRankingUseCase } from '@/features/leaderboard/domain/usecases/SyncAndFetchRankingUseCase';
import { GetLevelsOverviewUseCase } from '@/features/levels/domain/usecases/GetLevelsOverviewUseCase';
import { SupabaseProgressRemoteDataSource } from '@/features/quizzes/data/datasources/SupabaseProgressRemoteDataSource';
import { SqliteQuizProgressRepository } from '@/features/quizzes/data/repositories/SqliteQuizProgressRepository';
import { SqliteQuizRepository } from '@/features/quizzes/data/repositories/SqliteQuizRepository';
import { SqliteSyncStateRepository } from '@/features/quizzes/data/repositories/SqliteSyncStateRepository';
import { CheckAnswerUseCase } from '@/features/quizzes/domain/usecases/CheckAnswerUseCase';
import { GetFinalExamStatusUseCase } from '@/features/quizzes/domain/usecases/GetFinalExamStatusUseCase';
import { GetSyncStatusUseCase } from '@/features/quizzes/domain/usecases/GetSyncStatusUseCase';
import { ResetProgressUseCase } from '@/features/quizzes/domain/usecases/ResetProgressUseCase';
import { StartQuizUseCase } from '@/features/quizzes/domain/usecases/StartQuizUseCase';
import { SubmitQuizUseCase } from '@/features/quizzes/domain/usecases/SubmitQuizUseCase';
import { SyncProgressUseCase } from '@/features/quizzes/domain/usecases/SyncProgressUseCase';

export type Container = {
  clock: Clock;
  /** Sesión actual; el guard de navegación se suscribe a sus cambios (useSession). */
  session: SessionManager;
  /** Eventos de dominio (avance cambiado, nivel completado…) para refrescar y sincronizar. */
  events: DomainEventBus;
  connectivity: Connectivity;
  auth: {
    registerUser: RegisterUserUseCase;
    login: LoginUseCase;
    verifyEmailCode: VerifyEmailCodeUseCase;
    requestVerificationCode: RequestVerificationCodeUseCase;
    logout: LogoutUseCase;
    getCurrentUser: GetCurrentUserUseCase;
  };
  learning: {
    getCourseProgress: GetCourseProgressUseCase;
    getSyllabus: GetSyllabusUseCase;
    getLesson: GetLessonUseCase;
  };
  levels: {
    getLevelsOverview: GetLevelsOverviewUseCase;
  };
  quizzes: {
    startQuiz: StartQuizUseCase;
    checkAnswer: CheckAnswerUseCase;
    submitQuiz: SubmitQuizUseCase;
    getFinalExamStatus: GetFinalExamStatusUseCase;
  };
  /** Avance en la nube: sincronizar, estado del indicador y "Reiniciar mi avance". */
  progress: {
    syncProgress: SyncProgressUseCase;
    getSyncStatus: GetSyncStatusUseCase;
    resetProgress: ResetProgressUseCase;
  };
  leaderboard: {
    syncAndFetchRanking: SyncAndFetchRankingUseCase;
  };
  glossary: {
    getGlossary: GetGlossaryUseCase;
  };
};

/** Infraestructura ya lista (base migrada y sembrada, sesión cargada); la arma bootstrap.ts. */
export type ContainerDeps = {
  db: AppDatabase;
  session: SessionManager;
  clock: Clock;
  remote: RemoteClient;
  connectivity: Connectivity;
  /** Orden de las opciones en cada intento; por omisión, aleatorio. Las pruebas pasan keepOrder. */
  shuffler?: Shuffler;
};

export function createContainer({
  db,
  session,
  clock,
  remote,
  connectivity,
  shuffler = new RandomShuffler(),
}: ContainerDeps): Container {
  const uow = new SqliteUnitOfWork(db);
  const events = new InMemoryDomainEventBus();
  const authRemote = new SupabaseAuthRemoteDataSource(remote);
  const hasher = new Pbkdf2PasswordHasher();
  const localUsers = new SqliteLocalUserRepository(db, clock);
  const syllabi = new SqliteSyllabusRepository(db);
  const courseProgress = new SqliteCourseProgressRepository(db, session);
  const levels = new SqliteLevelRepository(db);
  const quizzes = new SqliteQuizRepository(db);
  const quizProgress = new SqliteQuizProgressRepository(db, session);
  const getCourseProgress = new GetCourseProgressUseCase(courseProgress);
  const syncState = new SqliteSyncStateRepository(db, session, clock);
  const progressRemote = new SupabaseProgressRemoteDataSource(remote, session);
  const syncProgress = new SyncProgressUseCase(
    quizProgress,
    syncState,
    progressRemote,
    uow,
    connectivity,
    clock,
    events,
    session,
  );

  return {
    clock,
    session,
    events,
    connectivity,
    auth: {
      registerUser: new RegisterUserUseCase(authRemote, hasher, localUsers, session),
      login: new LoginUseCase(authRemote, hasher, localUsers, session, syncProgress),
      verifyEmailCode: new VerifyEmailCodeUseCase(authRemote, localUsers, session),
      requestVerificationCode: new RequestVerificationCodeUseCase(authRemote, localUsers, session),
      logout: new LogoutUseCase(session),
      getCurrentUser: new GetCurrentUserUseCase(localUsers, session),
    },
    learning: {
      getCourseProgress,
      getSyllabus: new GetSyllabusUseCase(syllabi, courseProgress),
      getLesson: new GetLessonUseCase(new SqliteLessonRepository(db), courseProgress),
    },
    levels: {
      getLevelsOverview: new GetLevelsOverviewUseCase(levels, getCourseProgress),
    },
    quizzes: {
      startQuiz: new StartQuizUseCase(quizzes, getCourseProgress, shuffler),
      checkAnswer: new CheckAnswerUseCase(quizzes),
      submitQuiz: new SubmitQuizUseCase(
        quizzes,
        quizProgress,
        uow,
        getCourseProgress,
        clock,
        events,
      ),
      getFinalExamStatus: new GetFinalExamStatusUseCase(quizzes, quizProgress, getCourseProgress),
    },
    progress: {
      syncProgress,
      getSyncStatus: new GetSyncStatusUseCase(quizProgress, syncState, connectivity),
      resetProgress: new ResetProgressUseCase(
        quizProgress,
        syncState,
        progressRemote,
        uow,
        connectivity,
        clock,
        events,
      ),
    },
    leaderboard: {
      syncAndFetchRanking: new SyncAndFetchRankingUseCase(
        syncProgress,
        new SupabaseRankingRemoteDataSource(remote, session),
        new SqliteRankingCache(db, session),
        connectivity,
        clock,
      ),
    },
    glossary: {
      getGlossary: new GetGlossaryUseCase(new SqliteGlossaryRepository(db)),
    },
  };
}
