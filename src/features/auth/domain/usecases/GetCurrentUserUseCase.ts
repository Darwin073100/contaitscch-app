import type { SessionManager } from '@/core/session/SessionStore';

import type { UserProfile } from '../entities/AuthUser';
import type { LocalUserRepository } from '../repositories/LocalUserRepository';

/** Perfil del usuario con sesión (saludo, iniciales, perfil); null sin sesión. */
export class GetCurrentUserUseCase {
  constructor(
    private readonly users: LocalUserRepository,
    private readonly session: Pick<SessionManager, 'current'>,
  ) {}

  async execute(): Promise<UserProfile | null> {
    const current = this.session.current();
    return current ? this.users.find(current.userId) : null;
  }
}
