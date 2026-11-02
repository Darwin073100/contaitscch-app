import { openAppDatabase } from '@/core/database/client';
import type { AppDatabase } from '@/core/database/database';
import { migrateDatabase } from '@/core/database/migrate';

let started: Promise<AppDatabase> | null = null;

/**
 * Prepara la app una sola vez por proceso: abre SQLite y aplica las migraciones.
 * Pendiente: sembrar el contenido (ContentSeeder) y restaurar la sesión.
 */
export function bootstrap(): Promise<AppDatabase> {
  started ??= start();
  return started;
}

async function start(): Promise<AppDatabase> {
  const db = openAppDatabase();
  await migrateDatabase(db);
  return db;
}
