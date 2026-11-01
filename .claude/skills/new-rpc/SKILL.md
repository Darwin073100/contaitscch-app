---
name: new-rpc
description: Crea una función RPC de Supabase (PostgreSQL) segura con su migración, permisos y el método correspondiente en el data source remoto de la app. Úsalo cuando la app necesite leer o escribir algo nuevo en Supabase.
argument-hint: <nombre_funcion> [qué hace]
---

Crea la función RPC `$ARGUMENTS`.

Migraciones existentes:
!`ls supabase/migrations 2>/dev/null | tail -5`

## Plantilla SQL
```sql
create or replace function <nombre>(p_user_id uuid, p_token uuid /*, ... */)
returns <tipo>
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform assert_owner(p_user_id, p_token);   -- valida api_token
  -- lógica; inserts idempotentes con "on conflict do nothing"
end $$;

revoke execute on function <nombre>(uuid, uuid /*, ... */) from public;
grant  execute on function <nombre>(uuid, uuid /*, ... */) to anon;   -- solo si la app la llama
```

## Pasos
1. `supabase migration new <nombre>` y escribe el SQL en el archivo creado.
2. Nunca expongas `password_hash`, `password_salt` completo de otros usuarios ni `api_token` ajenos.
3. En la app: método en `src/features/<feature>/data/datasources/<X>RemoteDataSource.ts`
   usando `supabase.rpc('<nombre>', { p_user_id, p_token, ... })`, DTO tipado y mapper a entidad.
4. Manejo de errores: convierte el error de Supabase a `Result` con un código de dominio.
5. Indica al usuario que ejecute `supabase db reset` (local) para probar; no lo ejecutes tú sin permiso.
6. Delega la revisión de seguridad al subagente `supabase-expert` si la función escribe datos.
