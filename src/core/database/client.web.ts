import type { Database, SqlValue } from 'sql.js';
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';

import type { AppDatabase } from './database';
import { connectSqlJsDatabase } from './sqlJsDatabase';
import { loadSnapshot, saveSnapshot } from './webSnapshotStore';

/** Espera tras una escritura antes de guardar: agrupa las de un mismo ejercicio o siembra. */
const SAVE_DELAY_MS = 300;
const WRITE_SQL = /^\s*(insert|update|delete|replace|create|drop|alter|commit|end)\b/i;
const TX_START = /^\s*begin\b/i;
const TX_END = /^\s*(commit|end|rollback)\b/i;

/**
 * Versión web (spec 09): SQLite con sql.js, en memoria, guardada completa en IndexedDB después de
 * cada escritura y al pasar a segundo plano.
 *
 * No se usa expo-sqlite en web: guarda en OPFS con archivos de acceso exclusivo que una pestaña
 * congelada (Safari en iPhone) nunca suelta, y la app ya no abría ("The object is in an invalid
 * state"). sql.js no bloquea nada, no necesita SharedArrayBuffer ni encabezados COOP/COEP, y tiene la
 * misma API síncrona que usa Drizzle. Si la app está abierta en dos pestañas, gana la última que
 * guarde; el avance igual se sincroniza con la nube.
 */
export async function openAppDatabase(): Promise<AppDatabase> {
  const SQL = await initSqlJs();
  const snapshot = await loadSnapshot().catch(() => null);
  const client = new SQL.Database(snapshot ?? undefined);
  const db = connectSqlJsDatabase(client);
  persistWrites(client);
  return db;
}

/** Observa las sentencias del cliente y guarda la base poco después de cada escritura. */
function persistWrites(client: Database): void {
  let inTransaction = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let saving = Promise.resolve();

  const save = () => {
    timer = null;
    // Nunca a medio camino de una transacción: se reintenta cuando termine
    if (inTransaction) {
      schedule();
      return;
    }
    const data = client.export();
    saving = saving.then(() => saveSnapshot(data)).catch(() => {});
  };
  const schedule = () => {
    if (timer === null) timer = setTimeout(save, SAVE_DELAY_MS);
  };
  const flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    save();
  };
  const observe = (sql: string) => {
    if (TX_START.test(sql)) inTransaction = true;
    else if (TX_END.test(sql)) inTransaction = false;
    if (WRITE_SQL.test(sql)) schedule();
  };

  const prepare = client.prepare.bind(client);
  client.prepare = (sql: string, params?: SqlValue[]) => {
    observe(sql);
    return prepare(sql, params);
  };
  const exec = client.exec.bind(client);
  client.exec = (sql: string, params?: SqlValue[]) => {
    observe(sql);
    return exec(sql, params);
  };
  const run = client.run.bind(client);
  client.run = (sql: string, params?: SqlValue[]) => {
    observe(sql);
    return run(sql, params);
  };

  // iOS puede cerrar la app en segundo plano sin avisar: se guarda al salir de la vista
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}
