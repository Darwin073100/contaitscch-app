import { openDatabaseAsync } from 'expo-sqlite';

import { connectDatabase, type AppDatabase } from './database';

const DATABASE_NAME = 'contaitscch.db';

/**
 * Versión web (spec 09): SQLite corre en un Web Worker y se guarda en el almacenamiento privado del
 * navegador (OPFS). La API síncrona que usa Drizzle solo funciona cuando el worker ya cargó, por eso
 * aquí se abre con openDatabaseAsync. Sin WAL: en el navegador no hay memoria compartida entre procesos.
 */
export async function openAppDatabase(): Promise<AppDatabase> {
  const client = await openDatabaseAsync(DATABASE_NAME);
  return connectDatabase(client);
}
