import { err, ok } from '@/core/result/Result';
import type { Session } from '@/core/session/SessionStore';

import type { RegisterInput } from '../entities/AuthUser';
import { PBKDF2_ITERATIONS } from '../policies/PasswordPolicy';
import type { AuthRemote, RegisterRequest } from '../ports/AuthRemote';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';
import { RegisterUserUseCase } from './RegisterUserUseCase';

const input: RegisterInput = {
  email: '  Ana@Correo.COM ',
  password: 'secreta123',
  firstName: 'Ana',
  lastName: 'López',
  country: 'México',
  state: 'Chiapas',
  city: null,
};

/** Hasher falso y determinista: deja ver qué recibió. */
const hasher: PasswordHasher = {
  createSalt: async () => 'sal',
  hash: async (password, salt, iterations) => `hash(${password}|${salt}|${iterations})`,
};

function setup(response: Awaited<ReturnType<AuthRemote['register']>>) {
  const requests: RegisterRequest[] = [];
  const remote = {
    register: async (request: RegisterRequest) => {
      requests.push(request);
      return response;
    },
  } as AuthRemote;
  const savedUsers: Parameters<LocalUserRepository['save']>[0][] = [];
  const sessions: Session[] = [];
  const useCase = new RegisterUserUseCase(
    remote,
    hasher,
    { save: async (u) => void savedUsers.push(u), markEmailVerified: async () => undefined },
    { save: async (s) => void sessions.push(s) },
  );
  return { useCase, requests, savedUsers, sessions };
}

describe('RegisterUserUseCase', () => {
  it('manda el hash (nunca la contraseña) y guarda usuario y sesión sin verificar', async () => {
    const { useCase, requests, savedUsers, sessions } = setup(
      ok({ userId: 'id-1', apiToken: 'token-1' }),
    );

    const result = await useCase.execute(input);

    expect(result).toEqual(
      ok({ userId: 'id-1', apiToken: 'token-1', email: 'ana@correo.com', emailVerified: false }),
    );
    expect(requests).toEqual([
      expect.objectContaining({
        email: 'ana@correo.com',
        passwordHash: `hash(secreta123|sal|${PBKDF2_ITERATIONS})`,
        passwordSalt: 'sal',
        passwordIterations: PBKDF2_ITERATIONS,
      }),
    ]);
    expect(JSON.stringify(requests)).not.toContain('"password"');
    expect(savedUsers).toEqual([
      expect.objectContaining({ id: 'id-1', email: 'ana@correo.com', emailVerified: false }),
    ]);
    expect(JSON.stringify(savedUsers)).not.toContain('secreta123');
    expect(sessions).toEqual([
      { userId: 'id-1', apiToken: 'token-1', email: 'ana@correo.com', emailVerified: false },
    ]);
  });

  it.each(['EMAIL_TAKEN', 'INVALID_INPUT', 'NETWORK'] as const)(
    'si el servidor responde %s no guarda nada',
    async (error) => {
      const { useCase, savedUsers, sessions } = setup(err(error));

      expect(await useCase.execute(input)).toEqual(err(error));
      expect(savedUsers).toEqual([]);
      expect(sessions).toEqual([]);
    },
  );
});
