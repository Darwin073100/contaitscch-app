/** Usuario con sesión iniciada en el dispositivo. Los repositorios lo leen para filtrar su progreso. */
export interface SessionStore {
  /** Id del usuario (el mismo que `profile.id` en Supabase). */
  requireUserId(): string;
}
