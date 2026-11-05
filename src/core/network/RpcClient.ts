import type { SupabaseClient } from '@supabase/supabase-js';

/** Respuesta de `supabase.rpc()`: datos o error (de red o de Postgres), nunca ambos. */
export type RpcResponse = {
  data: unknown;
  error: { message: string } | null;
};

/**
 * Lo único que los data sources remotos usan del cliente de Supabase. En las pruebas se reemplaza
 * por un objeto falso; en la app es `supabase` (core/network/supabaseClient.ts).
 */
export type RpcClient = {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<RpcResponse>;
};

// Si el cliente real deja de cumplir el contrato, esto deja de compilar.
type ClientFitsContract = SupabaseClient extends RpcClient ? true : never;
export const supabaseClientFitsRpcClient: ClientFitsContract = true;
