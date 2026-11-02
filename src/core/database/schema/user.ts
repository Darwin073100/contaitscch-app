import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { auditColumns } from './columns';

// La contraseña no se guarda aquí: la app la convierte en hash PBKDF2 y solo Supabase guarda su digest.
export const users = sqliteTable('user', {
  /** Mismo UUID que `profile.id` en Supabase. */
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  country: text('country').notNull(),
  state: text('state').notNull(),
  city: text('city'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  ...auditColumns,
});
