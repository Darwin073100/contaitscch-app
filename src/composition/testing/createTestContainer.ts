import { quizProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
} from '@/core/database/testing/createSeededTestDatabase';
import type { RemoteClient } from '@/core/network/RpcClient';
import { SecureSessionStore } from '@/core/session/SecureSessionStore';
import type { Session } from '@/core/session/SessionStore';
import { memoryStorage } from '@/core/session/testing/memoryStorage';

import { createContainer, type Container } from '../container';

export type TestContainerOptions = {
  /** Temas con el ejercicio aprobado. */
  completedTopics?: number[];
  /** Sesión inicial; por defecto el usuario de prueba ya verificado. `null` = sin sesión. */
  session?: Session | null;
  /** Cliente remoto; por defecto todas las llamadas fallan como sin red. */
  remote?: RemoteClient;
};

export const testUserSession: Session = {
  userId: TEST_USER_ID,
  apiToken: 'token-de-prueba',
  email: 'ana@correo.com',
  emailVerified: true,
};

const offlineRemote: RemoteClient = {
  rpc: async () => ({ data: null, error: { message: 'Sin red en pruebas' } }),
  functions: { invoke: async () => ({ data: null, error: { message: 'Sin red en pruebas' } }) },
};

/**
 * Contenedor real sobre SQLite en memoria con el contenido del curso, para pruebas de pantallas.
 * Vive en composition porque presentation no puede tocar la base de datos.
 */
export async function createTestContainer(options: TestContainerOptions = {}): Promise<Container> {
  const db = await createSeededTestDatabase();
  const at = testClock.nowIso();
  const { completedTopics = [] } = options;
  if (completedTopics.length > 0) {
    // El ejercicio de un tema tiene el mismo id que el tema
    db.insert(quizProgress)
      .values(
        completedTopics.map((topicId) => ({
          userId: TEST_USER_ID,
          quizId: topicId,
          passed: true,
          bestScore: 2,
          attempts: 1,
          passedAt: at,
          updatedAt: at,
        })),
      )
      .run();
  }

  const session = new SecureSessionStore(memoryStorage().storage);
  const initial = options.session === undefined ? testUserSession : options.session;
  if (initial) await session.save(initial);

  return createContainer({
    db,
    session,
    clock: testClock,
    remote: options.remote ?? offlineRemote,
  });
}
