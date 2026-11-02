import type { Clock } from '@/core/clock/Clock';
import type { SessionStore } from '@/core/session/SessionStore';

import type { AppDatabase } from '../database';
import { users } from '../schema';
import { ContentSeeder } from '../seed/ContentSeeder';
import { loadCourse } from '../seed/loadCourse';
import { SqliteUnitOfWork } from '../SqliteUnitOfWork';
import { createTestDatabase } from './createTestDatabase';

export const TEST_USER_ID = 'u1';

export const testSession: SessionStore = { requireUserId: () => TEST_USER_ID };

/** Reloj fijo: 2 de noviembre de 2026, 12:00 hora local. */
export const testClock: Clock = {
  nowIso: () => new Date(2026, 10, 2, 12, 0, 0).toISOString(),
  todayLocal: () => '2026-11-02',
};

/** Base en memoria con el contenido real del curso y el usuario de `testSession`, sin progreso. */
export async function createSeededTestDatabase(): Promise<AppDatabase> {
  const db = await createTestDatabase();
  await new ContentSeeder(db, new SqliteUnitOfWork(db), testClock).seedIfNeeded(loadCourse());
  db.insert(users)
    .values({
      id: TEST_USER_ID,
      firstName: 'Ana',
      lastName: 'López',
      email: 'ana@correo.com',
      country: 'México',
      state: 'Chiapas',
      emailVerified: true,
    })
    .run();
  return db;
}
