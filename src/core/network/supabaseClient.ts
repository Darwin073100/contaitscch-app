import { createClient } from '@supabase/supabase-js';

// Valores públicos (URL y publishable/anon key) definidos en .env.local.
// La seguridad no depende de ellos: las tablas solo se acceden por RPC con id + api_token.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local',
  );
}

// Sin Supabase Auth: no se guarda ni se refresca sesión de Supabase.
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
