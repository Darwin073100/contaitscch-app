import { err, ok, type Result } from '@/core/result/Result';
import type { SessionManager } from '@/core/session/SessionStore';

import type { AuthRemote, VerifyEmailError } from '../ports/AuthRemote';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

export type VerifyEmailCodeError = VerifyEmailError | 'NO_SESSION';

const CODE = /^\d{6}$/;

/**
 * Paso 2 del registro: valida el código con Supabase y marca el correo como verificado en SQLite y
 * en la sesión. Al cambiar la sesión, el guard abre las pestañas sin pedir login.
 */
export class VerifyEmailCodeUseCase {
  constructor(
    private readonly remote: AuthRemote,
    private readonly users: LocalUserRepository,
    private readonly session: SessionManager,
  ) {}

  async execute(code: string): Promise<Result<void, VerifyEmailCodeError>> {
    const trimmed = code.trim();
    if (!CODE.test(trimmed)) return err('INVALID_CODE'); // validación local rápida, sin red

    const current = this.session.current();
    if (!current) return err('NO_SESSION');

    const verified = await this.remote.verifyEmail(current, trimmed);
    if (!verified.ok) return verified;

    await this.users.markEmailVerified(current.userId);
    await this.session.markEmailVerified();
    return ok(undefined);
  }
}
