import { z } from 'zod';

import type { RemoteClient } from '@/core/network/RpcClient';
import { err, ok, type Result } from '@/core/result/Result';

import type {
  AuthRemote,
  CodeRequest,
  LoginParams,
  LoginResponse,
  NetworkError,
  RegisterRequest,
  RemoteCredentials,
  RequestCodeError,
  VerifyEmailError,
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

const VerifyEmailDto = z.enum([
  'ok',
  'invalid_code',
  'expired',
  'too_many_attempts',
  'no_code',
  'invalid_token',
]);

const verifyErrors: Record<Exclude<z.infer<typeof VerifyEmailDto>, 'ok'>, VerifyEmailError> = {
  invalid_code: 'INVALID_CODE',
  expired: 'EXPIRED',
  too_many_attempts: 'TOO_MANY_ATTEMPTS',
  no_code: 'NO_CODE',
  invalid_token: 'INVALID_TOKEN',
};

// Contrato de la Edge Function send-verification (supabase/functions): siempre HTTP 200 con status.
const SendVerificationDto = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), resend_in_seconds: z.number().int().nonnegative() }),
  z.object({ status: z.literal('cooldown'), retry_in_seconds: z.number().int().nonnegative() }),
  z.object({ status: z.literal('already_verified') }),
  z.object({ status: z.literal('invalid_token') }),
  z.object({ status: z.literal('send_failed') }),
]);

export class SupabaseAuthRemoteDataSource implements AuthRemote {
  constructor(private readonly client: RemoteClient) {}

  async verifyEmail(
    credentials: RemoteCredentials,
    code: string,
  ): Promise<Result<void, VerifyEmailError>> {
    const response = await this.call(
      'verify_email',
      { p_user_id: credentials.userId, p_token: credentials.apiToken, p_code: code },
      VerifyEmailDto,
    );
    if (!response.ok) return response;
    return response.value === 'ok' ? ok(undefined) : err(verifyErrors[response.value]);
  }

  /** Sin red, función no desplegada o respuesta inesperada: SEND_FAILED. */
  async requestVerificationCode(
    credentials: RemoteCredentials,
  ): Promise<Result<CodeRequest, RequestCodeError>> {
    try {
      const { data, error } = await this.client.functions.invoke('send-verification', {
        body: { userId: credentials.userId, apiToken: credentials.apiToken },
      });
      const parsed = SendVerificationDto.safeParse(data);
      if (error || !parsed.success) return err('SEND_FAILED');

      const dto = parsed.data;
      switch (dto.status) {
        case 'ok':
          return ok({ sent: true, resendInSeconds: dto.resend_in_seconds });
        case 'cooldown':
          return ok({ sent: false, resendInSeconds: dto.retry_in_seconds });
        case 'already_verified':
          return err('ALREADY_VERIFIED');
        case 'invalid_token':
          return err('INVALID_TOKEN');
        default:
          return err('SEND_FAILED');
      }
    } catch {
      return err('SEND_FAILED');
    }
  }

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
