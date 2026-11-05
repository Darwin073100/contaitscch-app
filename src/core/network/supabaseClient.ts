import { createClient } from '@supabase/supabase-js';

import type { RemoteClient } from './RpcClient';

/**
 * Cliente de Supabase con los valores públicos de .env.local (URL y publishable key).
 * La seguridad no depende de ellos: las tablas solo se acceden por RPC con id + api_token.
 * Es una función (no un módulo que lanza al importarse) para que el error de configuración llegue
 * al arranque de la app y se muestre en pantalla.
 */
export function createSupabaseClient(): RemoteClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local (ver supabase/README.md)',
    );
  }

  // Sin Supabase Auth: no se guarda ni se refresca sesión de Supabase.
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
