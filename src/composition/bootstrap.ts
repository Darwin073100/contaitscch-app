import { SystemClock } from '@/core/clock/Clock';
import { openAppDatabase } from '@/core/database/client';
import { migrateDatabase } from '@/core/database/migrate';
import { ContentSeeder } from '@/core/database/seed/ContentSeeder';
import { loadCourse } from '@/core/database/seed/loadCourse';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';

import { createContainer, type Container } from './container';
import { ensureDevSession } from './devSession';

let started: Promise<Container> | null = null;

/**
 * Prepara la app una sola vez por proceso: abre SQLite, aplica las migraciones, siembra el
 * contenido si cambió `manifest.version`, resuelve la sesión y arma el contenedor.
 */
export function bootstrap(): Promise<Container> {
  started ??= start();
  return started;
}

async function start(): Promise<Container> {
  const db = openAppDatabase();
  const clock = new SystemClock();
  await migrateDatabase(db);
  await new ContentSeeder(db, new SqliteUnitOfWork(db), clock).seedIfNeeded(loadCourse());
  // TEMPORAL: usuario local hasta que existan registro y login
  const session = ensureDevSession(db);
  return createContainer({ db, session, clock });
}
