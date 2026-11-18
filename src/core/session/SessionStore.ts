/** Credenciales del usuario en el dispositivo (se guardan cifradas en SecureStore). */
export type Session = {
  /** Id del usuario (el mismo que `profile.id` en Supabase y `user.id` en SQLite). */
  userId: string;
  /** Llave que se manda con el id en cada RPC. */
  apiToken: string;
  /** Correo de la cuenta (la pantalla de verificación lo muestra). */
  email: string;
  /** El usuario ya validó el código de su correo. */
  emailVerified: boolean;
  /** El servidor pide verificar el correo (private.settings). Apagado: se entra sin código. */
  verificationRequired: boolean;
};

/** Regla del guard: entra al curso si verificó su correo o si el servidor no pide verificación. */
export function canEnterApp(session: Session | null): boolean {
  return session !== null && (session.emailVerified || !session.verificationRequired);
}

/** Usuario con sesión iniciada en el dispositivo. Los repositorios lo leen para filtrar su progreso. */
export interface SessionStore {
  /** Id del usuario (el mismo que `profile.id` en Supabase). Lanza si no hay sesión (el guard lo evita). */
  requireUserId(): string;
}

/** Guarda la sesión al registrarse o iniciar sesión. */
export interface SessionWriter {
  save(session: Session): Promise<void>;
}

/** Sesión completa: lectura, escritura y cambios (la usan auth y el guard de navegación). */
export interface SessionManager extends SessionStore, SessionWriter {
  current(): Session | null;
  markEmailVerified(): Promise<void>;
  clear(): Promise<void>;
  /** Avisa cada vez que la sesión cambia. Devuelve la función para dejar de escuchar. */
  subscribe(listener: () => void): () => void;
}
