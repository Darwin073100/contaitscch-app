import { err, ok, type Result } from '@/core/result/Result';
import type { Session } from '@/core/session/SessionStore';

import type { AuthRemote, LoginParams, LoginResponse } from '../ports/AuthRemote';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';
import { LoginUseCase } from './LoginUseCase';

const hasher: PasswordHasher = {
  createSalt: async () => 'no-se-usa',
  hash: async (password, salt, iterations) => `hash(${password}|${salt}|${iterations})`,
};

const profile = {
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: 'López',
  country: 'México',
  state: 'Chiapas',
  city: 'Tuxtla Gutiérrez',
};

function setup(
  params: Result<LoginParams, 'NETWORK'>,
  login: Result<LoginResponse, 'INVALID_CREDENTIALS' | 'NETWORK'> = err('INVALID_CREDENTIALS'),
) {
  const calls: string[] = [];
  const remote = {
    getLoginParams: async (email: string) => {
      calls.push(`params:${email}`);
      return params;
    },
    login: async (email: string, hash: string) => {
      calls.push(`login:${email}:${hash}`);
      return login;
    },
  } as AuthRemote;
  const savedUsers: Parameters<LocalUserRepository['save']>[0][] = [];
  const sessions: Session[] = [];
  const useCase = new LoginUseCase(
    remote,
    hasher,
    { save: async (u) => void savedUsers.push(u) },
    { save: async (s) => void sessions.push(s) },
  );
  return { useCase, calls, savedUsers, sessions };
}

describe('LoginUseCase', () => {
  it('usa la sal y las iteraciones del servidor y guarda usuario y sesión', async () => {
    const { useCase, calls, savedUsers, sessions } = setup(
      ok({ salt: 'sal-de-ana', iterations: 75000 }),
      ok({ userId: 'id-1', apiToken: 'token-1', emailVerified: true, profile }),
    );

    const result = await useCase.execute({ email: ' ANA@correo.com', password: 'secreta123' });

    expect(result).toEqual(ok({ userId: 'id-1', apiToken: 'token-1', emailVerified: true }));
    expect(calls).toEqual([
      'params:ana@correo.com',
      'login:ana@correo.com:hash(secreta123|sal-de-ana|75000)',
    ]);
    expect(savedUsers).toEqual([{ ...profile, id: 'id-1', emailVerified: true }]);
    expect(sessions).toHaveLength(1);
  });

  it('con el correo sin verificar abre sesión igual, marcada como no verificada', async () => {
    const { useCase, sessions } = setup(
      ok({ salt: 's', iterations: 60000 }),
      ok({ userId: 'id-1', apiToken: 't', emailVerified: false, profile }),
    );

    await useCase.execute({ email: 'ana@correo.com', password: 'x' });

    expect(sessions).toEqual([{ userId: 'id-1', apiToken: 't', emailVerified: false }]);
  });

  it('credenciales incorrectas: no guarda nada', async () => {
    const { useCase, savedUsers, sessions } = setup(ok({ salt: 's', iterations: 60000 }));

    expect(await useCase.execute({ email: 'ana@correo.com', password: 'mala' })).toEqual(
      err('INVALID_CREDENTIALS'),
    );
    expect(savedUsers).toEqual([]);
    expect(sessions).toEqual([]);
  });

  it('sin conexión al pedir la sal: NETWORK y no intenta el login', async () => {
    const { useCase, calls } = setup(err('NETWORK'));

    expect(await useCase.execute({ email: 'ana@correo.com', password: 'x' })).toEqual(
      err('NETWORK'),
    );
    expect(calls).toEqual(['params:ana@correo.com']);
  });
});
