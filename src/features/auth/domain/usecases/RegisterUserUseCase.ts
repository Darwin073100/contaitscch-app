import { err, ok, type Result } from '@/core/result/Result';
import type { Session, SessionWriter } from '@/core/session/SessionStore';

import type { RegisterInput } from '../entities/AuthUser';
import { normalizeEmail, PBKDF2_ITERATIONS } from '../policies/PasswordPolicy';
import type { AuthRemote } from '../ports/AuthRemote';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

export type RegisterUserError = 'EMAIL_TAKEN' | 'INVALID_INPUT' | 'NETWORK';

/**
 * Paso 1 del registro: calcula el hash PBKDF2 en el teléfono, crea la cuenta en Supabase y guarda el
 * usuario y la sesión (sin verificar). Requiere conexión: el id lo genera el servidor.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly remote: AuthRemote,
    private readonly hasher: PasswordHasher,
    private readonly users: LocalUserRepository,
    private readonly session: SessionWriter,
  ) {}

  async execute({
    password,
    ...input
  }: RegisterInput): Promise<Result<Session, RegisterUserError>> {
    const profile = { ...input, email: normalizeEmail(input.email) };
    const salt = await this.hasher.createSalt();
    const passwordHash = await this.hasher.hash(password, salt, PBKDF2_ITERATIONS);

    const created = await this.remote.register({
      ...profile,
      passwordHash,
      passwordSalt: salt,
      passwordIterations: PBKDF2_ITERATIONS,
    });
    if (!created.ok) return err(created.error);

    const session: Session = { ...created.value, emailVerified: false };
    await this.users.save({ ...profile, id: session.userId, emailVerified: false });
    await this.session.save(session);
    return ok(session);
  }
}
