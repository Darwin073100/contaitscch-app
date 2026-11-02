import { openDatabaseSync } from 'expo-sqlite';

import { connectDatabase, type AppDatabase } from './database';

const DATABASE_NAME = 'contaitscch.db';

/** Abre la base local del dispositivo (una sola conexión para toda la app). */
export function openAppDatabase(): AppDatabase {
  const client = openDatabaseSync(DATABASE_NAME);
  // WAL: las lecturas no esperan a que termine una escritura
  client.execSync('PRAGMA journal_mode = WAL;');
  return connectDatabase(client);
}
