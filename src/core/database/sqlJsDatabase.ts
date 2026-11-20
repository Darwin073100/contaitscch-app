import { drizzle } from 'drizzle-orm/sql-js';
import type { Database } from 'sql.js';

import type { AppDatabase } from './database';
import * as schema from './schema';

/**
 * Envuelve una base de sql.js con Drizzle (versión web, spec 10). Solo la usan client.web.ts y sus
 * pruebas: Android no la importa. Drizzle trata igual a sql.js y a expo-sqlite (SQLite síncrono), por
 * eso se devuelve como `AppDatabase` y los repositorios no cambian.
 */
export function connectSqlJsDatabase(client: Database): AppDatabase {
  client.exec('PRAGMA foreign_keys = ON;');
  return drizzle(client, { schema }) as unknown as AppDatabase;
}
