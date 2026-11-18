import { err, ok, type Result } from '@/core/result/Result';
import type { Session, SessionWriter } from '@/core/session/SessionStore';

import type { LoginInput } from '../entities/AuthUser';
import { normalizeEmail } from '../policies/PasswordPolicy';
import type { AuthRemote } from '../ports/AuthRemote';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

export type LoginError = 'INVALID_CREDENTIALS' | 'NETWORK';

/** Lo único que necesita de SyncProgressUseCase (quizzes): traer el avance de la nube. */
export type ProgressRestorer = { execute(): Promise<unknown> };

/**
 * Pide la sal del usuario, recalcula el hash con la contraseña escrita y abre sesión.
 * Si el correo no está verificado y el servidor pide verificación, la sesión se guarda igual y el
 * guard lleva a la pantalla de verificación.
 * Al final trae el avance de la nube: en un teléfono nuevo se continúa donde se quedó. Si no se
 * puede (sin red), la sincronización lo reintenta después; el inicio de sesión no falla por eso.
 */
export class LoginUseCase {
  constructor(
    private readonly remote: AuthRemote,
    private readonly hasher: PasswordHasher,
    private readonly users: LocalUserRepository,
    private readonly session: SessionWriter,
    private readonly progress?: ProgressRestorer,
  ) {}

  async execute({ email, password }: LoginInput): Promise<Result<Session, LoginError>> {
    const normalized = normalizeEmail(email);
    const params = await this.remote.getLoginParams(normalized);
    if (!params.ok) return err(params.error);

    const passwordHash = await this.hasher.hash(
      password,
      params.value.salt,
      params.value.iterations,
    );
    const logged = await this.remote.login(normalized, passwordHash);
    if (!logged.ok) return err(logged.error);

    const { userId, apiToken, emailVerified, verificationRequired, profile } = logged.value;
    const session: Session = {
      userId,
      apiToken,
      email: profile.email,
      emailVerified,
      verificationRequired,
    };
    await this.users.save({ ...profile, id: userId, emailVerified });
    await this.session.save(session);
    await this.progress?.execute();
    return ok(session);
  }
}
