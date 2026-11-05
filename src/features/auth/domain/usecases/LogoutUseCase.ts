import type { SessionManager } from '@/core/session/SessionStore';

/**
 * Cierra la sesión en este dispositivo: borra id + api_token de SecureStore y el guard regresa al
 * registro. El progreso en SQLite se conserva (es de ese usuario; vuelve a verse si inicia sesión).
 */
export class LogoutUseCase {
  constructor(private readonly session: SessionManager) {}

  async execute(): Promise<void> {
    await this.session.clear();
  }
}
