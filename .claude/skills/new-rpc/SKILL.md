---
name: new-rpc
description: Crea una función RPC de Supabase (PostgreSQL) segura con su migración, permisos, pruebas pgTAP y el método correspondiente en el data source remoto de la app. Úsalo cuando la app necesite leer o escribir algo nuevo en Supabase.
argument-hint: <nombre_funcion> [qué hace]
---

Crea la función RPC `$ARGUMENTS`.

Migraciones existentes:
!`ls supabase/migrations 2>/dev/null | tail -5`

## Plantilla SQL

```sql
create function public.<nombre>(p_user_id uuid, p_token uuid /*, ... */)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;
  -- lógica con nombres calificados (public.tabla, extensions.digest…); responde { "status": … }
  return jsonb_build_object('status', 'ok');
end $$;

revoke execute on function public.<nombre>(uuid, uuid /*, ... */) from public, anon, authenticated;
grant  execute on function public.<nombre>(uuid, uuid /*, ... */) to anon;   -- solo si la app la llama
```

## Pasos

1. Crea `supabase/migrations/<AAAAMMDDhhmmss>_<nombre>.sql` (archivo nuevo: un hook bloquea editar uno
   existente) y sus pruebas pgTAP en `supabase/tests/<nombre>.test.sql`.
2. Nunca expongas `password_hash`, `password_salt` ni `api_token` de otros usuarios. Si la función
   devuelve datos de varios usuarios, léelos de una vista en el esquema `private`.
3. En la app: método en `src/features/<feature>/data/datasources/<X>RemoteDataSource.ts`
   usando `supabase.rpc('<nombre>', { p_user_id, p_token, ... })` con las credenciales de la sesión,
   DTO validado con Zod y mapper a entidad.
4. Manejo de errores: error de red o forma inesperada = `NETWORK`; cada `status` se convierte a un código
   de dominio en `Result`.
5. Prueba en local con `npx supabase db reset && npx supabase test db`; subir a la nube
   (`npx supabase db push`) lo decide el usuario.
6. Delega la revisión de seguridad al subagente `supabase-expert` si la función escribe datos.
