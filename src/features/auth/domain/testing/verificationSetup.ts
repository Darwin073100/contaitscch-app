import { ok, type Result } from '@/core/result/Result';
import { SecureSessionStore } from '@/core/session/SecureSessionStore';
import type { Session } from '@/core/session/SessionStore';
import { memoryStorage } from '@/core/session/testing/memoryStorage';

import type {
  AuthRemote,
  CodeRequest,
  RequestCodeError,
  VerifyEmailError,
} from '../ports/AuthRemote';
import { LogoutUseCase } from '../usecases/LogoutUseCase';
import { RequestVerificationCodeUseCase } from '../usecases/RequestVerificationCodeUseCase';
import { VerifyEmailCodeUseCase } from '../usecases/VerifyEmailCodeUseCase';

/** Sesión de un usuario recién registrado (sin verificar). */
export const pending: Session = {
  userId: 'id-1',
  apiToken: 'token-1',
  email: 'ana@correo.com',
  emailVerified: false,
};

/**
 * Casos de uso de verificación y cierre de sesión con una sesión real en memoria y un remoto falso
 * que registra las llamadas.
 */
export async function setupVerification(options: {
  verify?: Result<void, VerifyEmailError>;
  request?: Result<CodeRequest, RequestCodeError>;
  session?: Session | null;
}) {
  const session = new SecureSessionStore(memoryStorage().storage);
  if (options.session !== null) await session.save(options.session ?? pending);

  const calls: string[] = [];
  const remote = {
    verifyEmail: async (credentials, code) => {
      calls.push(`verify:${credentials.userId}:${credentials.apiToken}:${code}`);
      return options.verify ?? ok(undefined);
    },
    requestVerificationCode: async (credentials) => {
      calls.push(`request:${credentials.userId}`);
      return options.request ?? ok({ sent: true, resendInSeconds: 45 });
    },
  } as AuthRemote;
  const verifiedUsers: string[] = [];
  const users = {
    save: async () => undefined,
    markEmailVerified: async (id: string) => void verifiedUsers.push(id),
  };

  return {
    session,
    calls,
    verifiedUsers,
    verify: new VerifyEmailCodeUseCase(remote, users, session),
    request: new RequestVerificationCodeUseCase(remote, users, session),
    logout: new LogoutUseCase(session),
  };
}
