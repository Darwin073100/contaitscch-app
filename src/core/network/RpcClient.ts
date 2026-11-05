import type { SupabaseClient } from '@supabase/supabase-js';

/** Respuesta de `supabase.rpc()` y `supabase.functions.invoke()`: datos o error, nunca ambos. */
export type RpcResponse = {
  data: unknown;
  error: { message: string } | null;
};

/** Llamadas a funciones RPC de Postgres. */
export type RpcClient = {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<RpcResponse>;
};

/** Llamadas a Edge Functions. */
export type FunctionsClient = {
  functions: {
    invoke(name: string, options: { body: Record<string, unknown> }): Promise<RpcResponse>;
  };
};

/**
 * Lo único que los data sources remotos usan del cliente de Supabase. En las pruebas se reemplaza
 * por un objeto falso; en la app es `createSupabaseClient()` (core/network/supabaseClient.ts).
 */
export type RemoteClient = RpcClient & FunctionsClient;

// Si el cliente real deja de cumplir el contrato, esto deja de compilar.
type ClientFitsContract = SupabaseClient extends RemoteClient ? true : never;
export const supabaseClientFitsRemoteClient: ClientFitsContract = true;
