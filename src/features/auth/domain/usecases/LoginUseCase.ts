import { err, ok, type Result } from '@/core/result/Result';
import type { Session, SessionWriter } from '@/core/session/SessionStore';

import type { LoginInput } from '../entities/AuthUser';
import { normalizeEmail } from '../policies/PasswordPolicy';
import type { AuthRemote } from '../ports/AuthRemote';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

export type LoginError = 'INVALID_CREDENTIALS' | 'NETWORK';

/**
 * Pide la sal del usuario, recalcula el hash con la contraseña escrita y abre sesión.
 * Si el correo no está verificado, la sesión se guarda igual con `emailVerified: false`
 * y la UI lleva a la pantalla de verificación.
 * Pendiente (ranking): RestoreProgress para bajar xp_event y daily_activity en un dispositivo nuevo.
 */
export class LoginUseCase {
  constructor(
    private readonly remote: AuthRemote,
    private readonly hasher: PasswordHasher,
    private readonly users: LocalUserRepository,
    private readonly session: SessionWriter,
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

    const { userId, apiToken, emailVerified, profile } = logged.value;
    const session: Session = { userId, apiToken, emailVerified };
    await this.users.save({ ...profile, id: userId, emailVerified });
    await this.session.save(session);
    return ok(session);
  }
}
