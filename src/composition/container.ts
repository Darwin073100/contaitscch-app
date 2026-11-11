// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';
import { InMemoryDomainEventBus, type DomainEventBus } from '@/core/events/DomainEventBus';
import type { RemoteClient } from '@/core/network/RpcClient';
import type { SessionManager } from '@/core/session/SessionStore';
import { Pbkdf2PasswordHasher } from '@/features/auth/data/crypto/Pbkdf2PasswordHasher';
import { SupabaseAuthRemoteDataSource } from '@/features/auth/data/datasources/SupabaseAuthRemoteDataSource';
import { SqliteLocalUserRepository } from '@/features/auth/data/repositories/SqliteLocalUserRepository';
import { LoginUseCase } from '@/features/auth/domain/usecases/LoginUseCase';
import { LogoutUseCase } from '@/features/auth/domain/usecases/LogoutUseCase';
import { RegisterUserUseCase } from '@/features/auth/domain/usecases/RegisterUserUseCase';
import { RequestVerificationCodeUseCase } from '@/features/auth/domain/usecases/RequestVerificationCodeUseCase';
import { VerifyEmailCodeUseCase } from '@/features/auth/domain/usecases/VerifyEmailCodeUseCase';
import { SqliteGlossaryRepository } from '@/features/glossary/data/repositories/SqliteGlossaryRepository';
import { GetGlossaryUseCase } from '@/features/glossary/domain/usecases/GetGlossaryUseCase';
import { SqliteCourseProgressRepository } from '@/features/learning/data/repositories/SqliteCourseProgressRepository';
import { SqliteSyllabusRepository } from '@/features/learning/data/repositories/SqliteSyllabusRepository';
import { SqliteTopicRepository } from '@/features/learning/data/repositories/SqliteTopicRepository';
import { CompleteTopicUseCase } from '@/features/learning/domain/usecases/CompleteTopicUseCase';
import { GetCourseProgressUseCase } from '@/features/learning/domain/usecases/GetCourseProgressUseCase';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';
import { GetTopicSessionUseCase } from '@/features/learning/domain/usecases/GetTopicSessionUseCase';
import { SqliteLevelRepository } from '@/features/levels/data/repositories/SqliteLevelRepository';
import { GetLevelsOverviewUseCase } from '@/features/levels/domain/usecases/GetLevelsOverviewUseCase';
import { SqliteQuizProgressRepository } from '@/features/quizzes/data/repositories/SqliteQuizProgressRepository';
import { SqliteQuizRepository } from '@/features/quizzes/data/repositories/SqliteQuizRepository';
import { CheckAnswerUseCase } from '@/features/quizzes/domain/usecases/CheckAnswerUseCase';
import { GetFinalExamStatusUseCase } from '@/features/quizzes/domain/usecases/GetFinalExamStatusUseCase';
import { StartQuizUseCase } from '@/features/quizzes/domain/usecases/StartQuizUseCase';
import { SubmitQuizUseCase } from '@/features/quizzes/domain/usecases/SubmitQuizUseCase';

export type Container = {
  clock: Clock;
  /** Sesión actual; el guard de navegación se suscribe a sus cambios (useSession). */
  session: SessionManager;
  /** Eventos de dominio (avance cambiado, nivel completado…) para refrescar y sincronizar. */
  events: DomainEventBus;
  auth: {
    registerUser: RegisterUserUseCase;
    login: LoginUseCase;
    verifyEmailCode: VerifyEmailCodeUseCase;
    requestVerificationCode: RequestVerificationCodeUseCase;
    logout: LogoutUseCase;
  };
  learning: {
    getCourseProgress: GetCourseProgressUseCase;
    getSyllabus: GetSyllabusUseCase;
    getTopicSession: GetTopicSessionUseCase;
    /** Temporal hasta la pantalla del ejercicio (F8): aprueba el tema al terminar de leerlo. */
    completeTopic: CompleteTopicUseCase;
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
};

export function createContainer({ db, session, clock, remote }: ContainerDeps): Container {
  const uow = new SqliteUnitOfWork(db);
  const events = new InMemoryDomainEventBus();
  const authRemote = new SupabaseAuthRemoteDataSource(remote);
  const hasher = new Pbkdf2PasswordHasher();
  const localUsers = new SqliteLocalUserRepository(db, clock);
  const syllabi = new SqliteSyllabusRepository(db);
  const courseProgress = new SqliteCourseProgressRepository(db, session);
  const topics = new SqliteTopicRepository(db, session, clock);
  const levels = new SqliteLevelRepository(db);
  const quizzes = new SqliteQuizRepository(db);
  const quizProgress = new SqliteQuizProgressRepository(db, session);
  const getCourseProgress = new GetCourseProgressUseCase(courseProgress);

  return {
    clock,
    session,
    events,
    auth: {
      registerUser: new RegisterUserUseCase(authRemote, hasher, localUsers, session),
      login: new LoginUseCase(authRemote, hasher, localUsers, session),
      verifyEmailCode: new VerifyEmailCodeUseCase(authRemote, localUsers, session),
      requestVerificationCode: new RequestVerificationCodeUseCase(authRemote, localUsers, session),
      logout: new LogoutUseCase(session),
    },
    learning: {
      getCourseProgress,
      getSyllabus: new GetSyllabusUseCase(syllabi, courseProgress),
      getTopicSession: new GetTopicSessionUseCase(topics),
      completeTopic: new CompleteTopicUseCase(topics),
    },
    levels: {
      getLevelsOverview: new GetLevelsOverviewUseCase(levels, getCourseProgress),
    },
    quizzes: {
      startQuiz: new StartQuizUseCase(quizzes, getCourseProgress),
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
    glossary: {
      getGlossary: new GetGlossaryUseCase(new SqliteGlossaryRepository(db)),
    },
  };
}
