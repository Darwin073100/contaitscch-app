import type { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseSync, type SQLInputValue, type StatementSync } from 'node:sqlite';

import { connectDatabase, type AppDatabase } from '../database';
import { migrateDatabase } from '../migrate';

// Solo para pruebas en Jest: expo-sqlite es nativo y no corre en Node. Este adaptador implementa
// sobre node:sqlite los únicos métodos que usa el driver expo-sqlite de Drizzle.

type Params = SQLInputValue[];

function resultOf(statement: StatementSync, params: Params) {
  if (statement.columns().length === 0) {
    const { changes, lastInsertRowid } = statement.run(...params);
    return {
      changes: Number(changes),
      lastInsertRowId: Number(lastInsertRowid),
      getAllSync: () => [],
      getFirstSync: () => null,
    };
  }
  const rows = statement.all(...params);
  return {
    changes: 0,
    lastInsertRowId: 0,
    getAllSync: () => rows,
    getFirstSync: () => rows[0] ?? null,
  };
}

function nodeSqliteClient(sqlite: DatabaseSync) {
  return {
    execSync: (source: string) => sqlite.exec(source),
    prepareSync: (source: string) => {
      const statement = sqlite.prepare(source);
      return {
        executeSync: (params: Params = []) => {
          statement.setReturnArrays(false);
          return resultOf(statement, params);
        },
        executeForRawResultSync: (params: Params = []) => {
          statement.setReturnArrays(true);
          return resultOf(statement, params);
        },
      };
    },
  };
}

/** Base en memoria con las migraciones aplicadas, para pruebas de repositorios. */
export async function createTestDatabase(): Promise<AppDatabase> {
  const client = nodeSqliteClient(new DatabaseSync(':memory:'));
  const db = connectDatabase(client as unknown as SQLiteDatabase);
  await migrateDatabase(db);
  return db;
}
