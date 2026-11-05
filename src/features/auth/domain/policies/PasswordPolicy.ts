/**
 * Iteraciones de PBKDF2 para los registros nuevos. Supabase guarda las de cada usuario: si este valor
 * cambia, los usuarios antiguos siguen entrando con las suyas (las devuelve get_login_params).
 * 60 000 tardan alrededor de un segundo en un teléfono de gama media.
 */
export const PBKDF2_ITERATIONS = 60_000;

/** Normaliza el correo igual que Postgres (lower + btrim) para no depender de la UI. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
