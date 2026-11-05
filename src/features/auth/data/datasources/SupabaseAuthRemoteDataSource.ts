import { z } from 'zod';

import type { RpcClient } from '@/core/network/RpcClient';
import { err, ok, type Result } from '@/core/result/Result';

import type {
  AuthRemote,
  LoginParams,
  LoginResponse,
  NetworkError,
  RegisterRequest,
  RemoteCredentials,
} from '../../domain/ports/AuthRemote';

// DTOs de las RPC (snake_case, ver supabase/migrations). Una respuesta con otra forma se trata como
// error de red: la app no adivina.
const RegisterDto = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), user_id: z.uuid(), api_token: z.uuid() }),
  z.object({ status: z.literal('email_taken') }),
  z.object({ status: z.literal('invalid_input') }),
]);

const LoginParamsDto = z.object({
  salt: z.string().regex(/^[0-9a-f]{32}$/),
  iterations: z.number().int().positive(),
});

const LoginDto = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    user_id: z.uuid(),
    api_token: z.uuid(),
    email_verified: z.boolean(),
    profile: z.object({
      email: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      country: z.string(),
      state: z.string(),
      city: z.string().nullable(),
    }),
  }),
  z.object({ status: z.literal('invalid_credentials') }),
]);

export class SupabaseAuthRemoteDataSource implements AuthRemote {
  constructor(private readonly client: RpcClient) {}

  async register(
    request: RegisterRequest,
  ): Promise<Result<RemoteCredentials, 'EMAIL_TAKEN' | 'INVALID_INPUT' | NetworkError>> {
    const response = await this.call(
      'register',
      {
        p_email: request.email,
        p_first_name: request.firstName,
        p_last_name: request.lastName,
        p_country: request.country,
        p_state: request.state,
        p_city: request.city,
        p_password_hash: request.passwordHash,
        p_password_salt: request.passwordSalt,
        p_password_iterations: request.passwordIterations,
      },
      RegisterDto,
    );
    if (!response.ok) return response;

    const dto = response.value;
    if (dto.status === 'email_taken') return err('EMAIL_TAKEN');
    if (dto.status === 'invalid_input') return err('INVALID_INPUT');
    return ok({ userId: dto.user_id, apiToken: dto.api_token });
  }

  async getLoginParams(email: string): Promise<Result<LoginParams, NetworkError>> {
    return this.call('get_login_params', { p_email: email }, LoginParamsDto);
  }

  async login(
    email: string,
    passwordHash: string,
  ): Promise<Result<LoginResponse, 'INVALID_CREDENTIALS' | NetworkError>> {
    const response = await this.call(
      'login',
      { p_email: email, p_password_hash: passwordHash },
      LoginDto,
    );
    if (!response.ok) return response;

    const dto = response.value;
    if (dto.status === 'invalid_credentials') return err('INVALID_CREDENTIALS');
    const { profile } = dto;
    return ok({
      userId: dto.user_id,
      apiToken: dto.api_token,
      emailVerified: dto.email_verified,
      profile: {
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        country: profile.country,
        state: profile.state,
        city: profile.city,
      },
    });
  }

  /** Llama la RPC y valida la respuesta. Sin red, error de Postgres o forma inesperada: NETWORK. */
  private async call<T>(
    fn: string,
    args: Record<string, unknown>,
    schema: z.ZodType<T>,
  ): Promise<Result<T, NetworkError>> {
    try {
      const { data, error } = await this.client.rpc(fn, args);
      if (error) return err('NETWORK');
      const parsed = schema.safeParse(data);
      return parsed.success ? ok(parsed.data) : err('NETWORK');
    } catch {
      return err('NETWORK');
    }
  }
}
