import type { AppDatabase } from '@/core/database/database';
import { users } from '@/core/database/schema';
import type { SessionStore } from '@/core/session/SessionStore';

// TEMPORAL: usuario local para guardar el progreso mientras no existe el registro.
// Se borra cuando la sesión venga de SecureStore (registro y login); su progreso queda huérfano.
export const DEV_USER_ID = '00000000-0000-4000-8000-000000000001';

/** Crea el usuario local si no existe y devuelve una sesión fija con su id. */
export function ensureDevSession(db: AppDatabase): SessionStore {
  db.insert(users)
    .values({
      id: DEV_USER_ID,
      firstName: 'Estudiante',
      lastName: 'Local',
      email: 'estudiante.local@contaitscch.dev',
      country: 'México',
      state: 'Chiapas',
      emailVerified: true,
    })
    .onConflictDoNothing()
    .run();
  return { requireUserId: () => DEV_USER_ID };
}
