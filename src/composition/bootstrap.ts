import { SystemClock } from '@/core/clock/Clock';
import { openAppDatabase } from '@/core/database/client';
import { migrateDatabase } from '@/core/database/migrate';
import { ContentSeeder } from '@/core/database/seed/ContentSeeder';
import { loadCourse } from '@/core/database/seed/loadCourse';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';
import { createSupabaseClient } from '@/core/network/supabaseClient';
import { SecureSessionStore } from '@/core/session/SecureSessionStore';
import { secureStorage } from '@/core/session/secureStorage';

import { createContainer, type Container } from './container';

let started: Promise<Container> | null = null;

/**
 * Prepara la app una sola vez por proceso: abre SQLite, aplica las migraciones, siembra el
 * contenido si cambió `manifest.version`, carga la sesión de SecureStore y arma el contenedor.
 */
export function bootstrap(): Promise<Container> {
  started ??= start();
  return started;
}

async function start(): Promise<Container> {
  const remote = createSupabaseClient();
  const db = openAppDatabase();
  const clock = new SystemClock();
  await migrateDatabase(db);
  await new ContentSeeder(db, new SqliteUnitOfWork(db), clock).seedIfNeeded(loadCourse());
  const session = new SecureSessionStore(secureStorage);
  await session.load();
  return createContainer({ db, session, clock, remote });
}
