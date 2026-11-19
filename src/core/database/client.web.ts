import { openDatabaseAsync } from 'expo-sqlite';

import { connectDatabase, type AppDatabase } from './database';

const DATABASE_NAME = 'contaitscch.db';
/** Intentos para abrir la base mientras otra página la suelta (≈ 6 s en total). */
const OPEN_ATTEMPTS = 12;
const OPEN_RETRY_MS = 500;

/**
 * Versión web (spec 09): SQLite corre en un Web Worker y se guarda en el almacenamiento privado del
 * navegador (OPFS). La API síncrona que usa Drizzle solo funciona cuando el worker ya cargó, por eso
 * aquí se abre con openDatabaseAsync. Sin WAL: en el navegador no hay memoria compartida entre procesos.
 *
 * OPFS deja abrir los archivos de la base a una sola página a la vez. Al recargar, la página anterior
 * puede tardar en soltarlos, así que se reintenta unos segundos. Si otra pestaña tiene la app abierta,
 * no se suelta nunca: se avisa con un mensaje claro.
 */
export async function openAppDatabase(): Promise<AppDatabase> {
  let lastError: unknown;
  for (let attempt = 0; attempt < OPEN_ATTEMPTS; attempt++) {
    try {
      return connectDatabase(await openDatabaseAsync(DATABASE_NAME));
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, OPEN_RETRY_MS));
    }
  }
  throw new Error(describeOpenError(lastError));
}

function describeOpenError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/Access Handle|NoModificationAllowed|InvalidState/i.test(message)) {
    return 'CONTAITSCCH ya está abierta en otra pestaña o ventana de este navegador. Ciérrala y toca Reintentar.';
  }
  return `No se pudo abrir la base de datos del navegador: ${message}`;
}
