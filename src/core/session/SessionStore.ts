/** Credenciales del usuario en el dispositivo (se guardan cifradas en SecureStore). */
export type Session = {
  /** Id del usuario (el mismo que `profile.id` en Supabase y `user.id` en SQLite). */
  userId: string;
  /** Llave que se manda con el id en cada RPC. */
  apiToken: string;
  /** Sin verificar, el guard manda a la pantalla de verificación en lugar de a las pestañas. */
  emailVerified: boolean;
};

/** Usuario con sesión iniciada en el dispositivo. Los repositorios lo leen para filtrar su progreso. */
export interface SessionStore {
  /** Id del usuario (el mismo que `profile.id` en Supabase). */
  requireUserId(): string;
}

/** Guarda la sesión al registrarse o iniciar sesión. */
export interface SessionWriter {
  save(session: Session): Promise<void>;
}
