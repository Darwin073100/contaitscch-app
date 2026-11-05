// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
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
  /** Sesión actual; el guard de navegación se suscribe a sus cambios (useSession). */
  session: SessionManager;
  auth: {
    registerUser: RegisterUserUseCase;
    login: LoginUseCase;
    verifyEmailCode: VerifyEmailCodeUseCase;
    requestVerificationCode: RequestVerificationCodeUseCase;
    logout: LogoutUseCase;
  };
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

/** Infraestructura ya lista (base migrada y sembrada, sesión cargada); la arma bootstrap.ts. */
export type ContainerDeps = {
  db: AppDatabase;
  session: SessionManager;
  clock: Clock;
  remote: RemoteClient;
};

export function createContainer({ db, session, clock, remote }: ContainerDeps): Container {
  const authRemote = new SupabaseAuthRemoteDataSource(remote);
  const hasher = new Pbkdf2PasswordHasher();
  const localUsers = new SqliteLocalUserRepository(db, clock);
  const syllabi = new SqliteSyllabusRepository(db, session);
  const topics = new SqliteTopicRepository(db, session, clock);
  const levels = new SqliteLevelRepository(db, session);
  const stats = new SqliteStatsRepository(db, session);

  return {
    clock,
    session,
    auth: {
      registerUser: new RegisterUserUseCase(authRemote, hasher, localUsers, session),
      login: new LoginUseCase(authRemote, hasher, localUsers, session),
      verifyEmailCode: new VerifyEmailCodeUseCase(authRemote, localUsers, session),
      requestVerificationCode: new RequestVerificationCodeUseCase(authRemote, localUsers, session),
      logout: new LogoutUseCase(session),
    },
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
