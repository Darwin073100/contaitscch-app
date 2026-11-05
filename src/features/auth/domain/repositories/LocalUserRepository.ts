import type { UserProfile } from '../entities/AuthUser';

/** Tabla `user` de SQLite: el perfil del usuario con sesión en este dispositivo. */
export interface LocalUserRepository {
  /** Inserta o actualiza el usuario por id. */
  save(user: UserProfile & { id: string; emailVerified: boolean }): Promise<void>;
}
