import { openDatabaseSync } from 'expo-sqlite';

import { connectDatabase, type AppDatabase } from './database';

const DATABASE_NAME = 'contaitscch.db';

/**
 * Abre la base local del dispositivo (una sola conexión para toda la app). Es async por la versión
 * web (client.web.ts); en Android e iOS la apertura sigue siendo síncrona.
 */
export async function openAppDatabase(): Promise<AppDatabase> {
  const client = openDatabaseSync(DATABASE_NAME);
  // WAL: las lecturas no esperan a que termine una escritura
  client.execSync('PRAGMA journal_mode = WAL;');
  return connectDatabase(client);
}
