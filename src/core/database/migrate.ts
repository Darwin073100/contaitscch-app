import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import type { AppDatabase } from './database';
import migrations from './migrations/migrations';

/** Aplica las migraciones pendientes (Drizzle lleva el registro en __drizzle_migrations). */
export function migrateDatabase(db: AppDatabase): Promise<void> {
  return migrate(db, migrations);
}
