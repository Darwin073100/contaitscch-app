import type { Result } from '@/core/result/Result';

import type { UserProfile } from '../entities/AuthUser';

/** Sin conexión, o el servidor respondió algo inesperado. */
export type NetworkError = 'NETWORK';

export type RemoteCredentials = { userId: string; apiToken: string };

export type RegisterRequest = UserProfile & {
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
};

export type LoginParams = { salt: string; iterations: number };

export type LoginResponse = RemoteCredentials & { emailVerified: boolean; profile: UserProfile };

/** Respuestas de verify_email (supabase/migrations/…_email_verification.sql). */
export type VerifyEmailError =
  'INVALID_CODE' | 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'NO_CODE' | 'INVALID_TOKEN' | NetworkError;

/**
 * Resultado de pedir un código. `sent: false` = todavía en espera (cooldown): el código anterior
 * sigue vigente y se puede reenviar en `resendInSeconds`.
 */
export type CodeRequest = { sent: boolean; resendInSeconds: number };

/** No se pudo enviar el correo, o no hubo conexión con la Edge Function. */
export type RequestCodeError = 'ALREADY_VERIFIED' | 'INVALID_TOKEN' | 'SEND_FAILED';

/** RPC y Edge Functions de Supabase para la cuenta (ver supabase/migrations y supabase/functions). */
export interface AuthRemote {
  register(
    request: RegisterRequest,
  ): Promise<Result<RemoteCredentials, 'EMAIL_TAKEN' | 'INVALID_INPUT' | NetworkError>>;
  getLoginParams(email: string): Promise<Result<LoginParams, NetworkError>>;
  login(
    email: string,
    passwordHash: string,
  ): Promise<Result<LoginResponse, 'INVALID_CREDENTIALS' | NetworkError>>;
  verifyEmail(
    credentials: RemoteCredentials,
    code: string,
  ): Promise<Result<void, VerifyEmailError>>;
  requestVerificationCode(
    credentials: RemoteCredentials,
  ): Promise<Result<CodeRequest, RequestCodeError>>;
}
