import type { Session } from '@/core/session/SessionStore';

import type { UserProfile } from '../entities/AuthUser';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';
import { GetCurrentUserUseCase } from './GetCurrentUserUseCase';

const ana: UserProfile = {
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: 'López',
  country: 'México',
  state: 'Chiapas',
  city: null,
};

const users: LocalUserRepository = {
  save: async () => undefined,
  markEmailVerified: async () => undefined,
  find: async (id) => (id === 'u1' ? ana : null),
};

const session = (current: Session | null) => ({ current: () => current });

describe('GetCurrentUserUseCase', () => {
  it('devuelve el perfil del usuario con sesión', async () => {
    const result = await new GetCurrentUserUseCase(
      users,
      session({ userId: 'u1', apiToken: 't', email: ana.email, emailVerified: true, verificationRequired: true }),
    ).execute();

    expect(result).toEqual(ana);
  });

  it('sin sesión devuelve null', async () => {
    expect(await new GetCurrentUserUseCase(users, session(null)).execute()).toBeNull();
  });
});
