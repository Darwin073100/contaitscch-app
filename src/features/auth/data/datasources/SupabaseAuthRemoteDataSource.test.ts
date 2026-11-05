import type { RemoteClient, RpcResponse } from '@/core/network/RpcClient';
import { err, ok } from '@/core/result/Result';

import { SupabaseAuthRemoteDataSource } from './SupabaseAuthRemoteDataSource';

const USER_ID = '592e3765-89e6-405f-9e3b-0666d45e3e2b';
const TOKEN = '11380c5b-e983-43d8-907a-cd156c941fbe';
const credentials = { userId: USER_ID, apiToken: TOKEN };

/**
 * Cliente falso: guarda las llamadas (RPC y Edge Functions) y responde lo indicado,
 * o lanza como un fetch caído.
 */
function fakeClient(response: RpcResponse | Error) {
  const calls: { fn: string; args?: Record<string, unknown> }[] = [];
  const respond = async (fn: string, args?: Record<string, unknown>) => {
    calls.push({ fn, args });
    if (response instanceof Error) throw response;
    return response;
  };
  const client: RemoteClient = {
    rpc: respond,
    functions: { invoke: (name, options) => respond(`functions/${name}`, options.body) },
  };
  return { remote: new SupabaseAuthRemoteDataSource(client), calls };
}

const request = {
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: 'López',
  country: 'México',
  state: 'Chiapas',
  city: null,
  passwordHash: 'a'.repeat(64),
  passwordSalt: '0'.repeat(32),
  passwordIterations: 60000,
};

describe('SupabaseAuthRemoteDataSource', () => {
  describe('register', () => {
    it('manda los parámetros con los nombres de la RPC y devuelve las credenciales', async () => {
      const { remote, calls } = fakeClient({
        data: { status: 'ok', user_id: USER_ID, api_token: TOKEN },
        error: null,
      });

      expect(await remote.register(request)).toEqual(ok({ userId: USER_ID, apiToken: TOKEN }));
      expect(calls).toEqual([
        {
          fn: 'register',
          args: {
            p_email: 'ana@correo.com',
            p_first_name: 'Ana',
            p_last_name: 'López',
            p_country: 'México',
            p_state: 'Chiapas',
            p_city: null,
            p_password_hash: 'a'.repeat(64),
            p_password_salt: '0'.repeat(32),
            p_password_iterations: 60000,
          },
        },
      ]);
    });

    it.each([
      ['email_taken', 'EMAIL_TAKEN'],
      ['invalid_input', 'INVALID_INPUT'],
    ] as const)('status %s → %s', async (status, error) => {
      const { remote } = fakeClient({ data: { status }, error: null });

      expect(await remote.register(request)).toEqual(err(error));
    });
  });

  describe('errores de red y respuestas inesperadas', () => {
    it.each([
      ['error de Postgres o HTTP', { data: null, error: { message: 'permission denied' } }],
      ['respuesta con otra forma', { data: { status: 'ok' }, error: null }],
      ['fetch que lanza', new Error('Network request failed')],
    ] as const)('%s → NETWORK', async (_case, response) => {
      const { remote } = fakeClient(response);

      expect(await remote.register(request)).toEqual(err('NETWORK'));
      expect(await remote.getLoginParams('ana@correo.com')).toEqual(err('NETWORK'));
    });
  });

  describe('login', () => {
    it('getLoginParams devuelve sal e iteraciones', async () => {
      const { remote, calls } = fakeClient({
        data: { salt: '0123456789abcdef0123456789abcdef', iterations: 60000 },
        error: null,
      });

      expect(await remote.getLoginParams('ana@correo.com')).toEqual(
        ok({ salt: '0123456789abcdef0123456789abcdef', iterations: 60000 }),
      );
      expect(calls).toEqual([{ fn: 'get_login_params', args: { p_email: 'ana@correo.com' } }]);
    });

    it('convierte el perfil de snake_case a camelCase', async () => {
      const { remote } = fakeClient({
        data: {
          status: 'ok',
          user_id: USER_ID,
          api_token: TOKEN,
          email_verified: true,
          profile: {
            email: 'ana@correo.com',
            first_name: 'Ana',
            last_name: 'López',
            country: 'México',
            state: 'Chiapas',
            city: null,
          },
        },
        error: null,
      });

      expect(await remote.login('ana@correo.com', 'a'.repeat(64))).toEqual(
        ok({
          userId: USER_ID,
          apiToken: TOKEN,
          emailVerified: true,
          profile: {
            email: 'ana@correo.com',
            firstName: 'Ana',
            lastName: 'López',
            country: 'México',
            state: 'Chiapas',
            city: null,
          },
        }),
      );
    });

    it('invalid_credentials → INVALID_CREDENTIALS', async () => {
      const { remote } = fakeClient({ data: { status: 'invalid_credentials' }, error: null });

      expect(await remote.login('ana@correo.com', 'x')).toEqual(err('INVALID_CREDENTIALS'));
    });
  });

  describe('verifyEmail', () => {
    it('manda id, token y código a verify_email', async () => {
      const { remote, calls } = fakeClient({ data: 'ok', error: null });

      expect(await remote.verifyEmail(credentials, '724913')).toEqual(ok(undefined));
      expect(calls).toEqual([
        { fn: 'verify_email', args: { p_user_id: USER_ID, p_token: TOKEN, p_code: '724913' } },
      ]);
    });

    it.each([
      ['invalid_code', 'INVALID_CODE'],
      ['expired', 'EXPIRED'],
      ['too_many_attempts', 'TOO_MANY_ATTEMPTS'],
      ['no_code', 'NO_CODE'],
      ['invalid_token', 'INVALID_TOKEN'],
    ] as const)('%s → %s', async (status, error) => {
      const { remote } = fakeClient({ data: status, error: null });

      expect(await remote.verifyEmail(credentials, '724913')).toEqual(err(error));
    });
  });

  describe('requestVerificationCode (Edge Function send-verification)', () => {
    it('invoca la función con id y token; ok → código enviado', async () => {
      const { remote, calls } = fakeClient({
        data: { status: 'ok', resend_in_seconds: 45 },
        error: null,
      });

      expect(await remote.requestVerificationCode(credentials)).toEqual(
        ok({ sent: true, resendInSeconds: 45 }),
      );
      expect(calls).toEqual([
        { fn: 'functions/send-verification', args: { userId: USER_ID, apiToken: TOKEN } },
      ]);
    });

    it('cooldown → no reenviado, con los segundos de espera', async () => {
      const { remote } = fakeClient({
        data: { status: 'cooldown', retry_in_seconds: 30 },
        error: null,
      });

      expect(await remote.requestVerificationCode(credentials)).toEqual(
        ok({ sent: false, resendInSeconds: 30 }),
      );
    });

    it.each([
      ['already_verified', 'ALREADY_VERIFIED'],
      ['invalid_token', 'INVALID_TOKEN'],
      ['send_failed', 'SEND_FAILED'],
    ] as const)('%s → %s', async (status, error) => {
      const { remote } = fakeClient({ data: { status }, error: null });

      expect(await remote.requestVerificationCode(credentials)).toEqual(err(error));
    });

    it.each([
      ['función no desplegada (error HTTP)', { data: null, error: { message: '404' } }],
      ['fetch que lanza', new Error('Network request failed')],
    ] as const)('%s → SEND_FAILED', async (_case, response) => {
      const { remote } = fakeClient(response);

      expect(await remote.requestVerificationCode(credentials)).toEqual(err('SEND_FAILED'));
    });
  });
});
