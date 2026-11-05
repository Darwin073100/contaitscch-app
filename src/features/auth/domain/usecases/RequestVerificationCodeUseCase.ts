import { err, type Result } from '@/core/result/Result';
import type { SessionManager } from '@/core/session/SessionStore';

import type { AuthRemote, CodeRequest, RequestCodeError } from '../ports/AuthRemote';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

export type RequestVerificationCodeError = RequestCodeError | 'NO_SESSION';

/** Pide a la Edge Function send-verification que envíe (o reenvíe) el código al correo. */
export class RequestVerificationCodeUseCase {
  constructor(
    private readonly remote: AuthRemote,
    private readonly users: LocalUserRepository,
    private readonly session: SessionManager,
  ) {}

  async execute(): Promise<Result<CodeRequest, RequestVerificationCodeError>> {
    const current = this.session.current();
    if (!current) return err('NO_SESSION');

    const result = await this.remote.requestVerificationCode(current);
    // Ya estaba verificado (por ejemplo, desde otro dispositivo): se refleja aquí y el guard
    // abre las pestañas.
    if (!result.ok && result.error === 'ALREADY_VERIFIED') {
      await this.users.markEmailVerified(current.userId);
      await this.session.markEmailVerified();
    }
    return result;
  }
}
