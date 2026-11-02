import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

export const levels = sqliteTable('level', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  /** 1 = Básico, 2 = Intermedio, 3 = Avanzado; define cuál es el "nivel anterior". */
  sortOrder: integer('sort_order').notNull().unique(),
  // Textos de la UI; el default '' solo existe para poder agregarlos con ALTER TABLE (0001)
  /** Nombre del módulo en el temario: "Introducción a la Contabilidad". */
  title: text('title').notNull().default(''),
  /** Frase corta bajo el nombre del módulo. */
  tagline: text('tagline').notNull().default(''),
  /** Tarjeta de Niveles: "Fundamentos y Cuentas". */
  subtitle: text('subtitle').notNull().default(''),
  description: text('description').notNull().default(''),
  ...auditColumns,
});
