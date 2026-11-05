import type { RpcClient, RpcResponse } from '@/core/network/RpcClient';
import { err, ok } from '@/core/result/Result';

import { SupabaseAuthRemoteDataSource } from './SupabaseAuthRemoteDataSource';

const USER_ID = '592e3765-89e6-405f-9e3b-0666d45e3e2b';
const TOKEN = '11380c5b-e983-43d8-907a-cd156c941fbe';

/** Cliente falso: guarda las llamadas y responde lo indicado (o lanza, como un fetch caído). */
function fakeClient(response: RpcResponse | Error) {
  const calls: { fn: string; args?: Record<string, unknown> }[] = [];
  const client: RpcClient = {
    rpc: async (fn, args) => {
      calls.push({ fn, args });
      if (response instanceof Error) throw response;
      return response;
    },
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
});
