import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

/**
 * Envuelve una conexión SQLite con Drizzle. `foreign_keys` es por conexión y SQLite lo trae
 * apagado, por eso se enciende aquí. Lo usan la app (client.ts) y las pruebas (testing/).
 */
export function connectDatabase(client: SQLiteDatabase): AppDatabase {
  client.execSync('PRAGMA foreign_keys = ON;');
  return drizzle(client, { schema });
}
