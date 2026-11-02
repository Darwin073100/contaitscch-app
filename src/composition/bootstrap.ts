import { SystemClock } from '@/core/clock/Clock';
import { openAppDatabase } from '@/core/database/client';
import type { AppDatabase } from '@/core/database/database';
import { migrateDatabase } from '@/core/database/migrate';
import { ContentSeeder } from '@/core/database/seed/ContentSeeder';
import { loadCourse } from '@/core/database/seed/loadCourse';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';

let started: Promise<AppDatabase> | null = null;

/**
 * Prepara la app una sola vez por proceso: abre SQLite, aplica las migraciones y siembra el
 * contenido si cambió `manifest.version`. Pendiente: restaurar la sesión.
 */
export function bootstrap(): Promise<AppDatabase> {
  started ??= start();
  return started;
}

async function start(): Promise<AppDatabase> {
  const db = openAppDatabase();
  await migrateDatabase(db);
  await new ContentSeeder(db, new SqliteUnitOfWork(db), new SystemClock()).seedIfNeeded(
    loadCourse(),
  );
  return db;
}
