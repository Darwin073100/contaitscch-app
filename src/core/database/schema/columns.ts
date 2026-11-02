import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/sqlite-core';

/** Instante actual en ISO-8601 UTC, el mismo formato que `Clock.nowIso()`. */
export const nowIsoSql = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

/**
 * Columnas de auditoría de todas las tablas. SQLite no actualiza `updated_at` solo:
 * los repositorios lo ponen en cada UPDATE.
 */
export const auditColumns = {
  createdAt: text('created_at').notNull().default(nowIsoSql),
  updatedAt: text('updated_at').notNull().default(nowIsoSql),
};
