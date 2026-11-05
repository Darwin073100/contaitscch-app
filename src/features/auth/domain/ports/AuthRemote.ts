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

/** RPC de Supabase para registro e inicio de sesión (ver supabase/migrations). */
export interface AuthRemote {
  register(
    request: RegisterRequest,
  ): Promise<Result<RemoteCredentials, 'EMAIL_TAKEN' | 'INVALID_INPUT' | NetworkError>>;
  getLoginParams(email: string): Promise<Result<LoginParams, NetworkError>>;
  login(
    email: string,
    passwordHash: string,
  ): Promise<Result<LoginResponse, 'INVALID_CREDENTIALS' | NetworkError>>;
}
