import { sql } from 'drizzle-orm';

import type { Tx, UnitOfWork } from '@/core/transaction/UnitOfWork';

import type { AppDatabase } from './database';

// No se usa db.transaction() de Drizzle: con expo-sqlite es síncrono y haría COMMIT antes de los
// await. Tampoco withExclusiveTransactionAsync: abre otra conexión sin foreign_keys.
// Se usa la misma conexión con BEGIN/COMMIT manual y una cola para no mezclar transacciones.
export class SqliteUnitOfWork implements UnitOfWork {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly db: AppDatabase) {}

  run<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    const result = this.queue.then(() => this.transaction(work));
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    this.db.run(sql`BEGIN IMMEDIATE`);
    try {
      const value = await work(this.db as unknown as Tx);
      this.db.run(sql`COMMIT`);
      return value;
    } catch (error) {
      try {
        this.db.run(sql`ROLLBACK`);
      } catch {
        // SQLite pudo haber deshecho la transacción por su cuenta; se conserva el error original.
      }
      throw error;
    }
  }
}

/** Para los repositorios de `data`: la conexión sobre la que corre la transacción. */
export function databaseOf(tx: Tx): AppDatabase {
  return tx as unknown as AppDatabase;
}
