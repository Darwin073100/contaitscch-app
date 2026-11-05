-- Esquema private: piezas internas que la API nunca expone (config.toml solo publica "public").

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Secreto del servidor, generado al aplicar la migración (distinto en local y en la nube).
-- Se usa para derivar la sal falsa de get_login_params: sin él no se puede saber si es falsa.
create table private.app_secret (
  id     boolean primary key default true check (id),
  value  text    not null
);
insert into private.app_secret (value) values (encode(extensions.gen_random_bytes(32), 'hex'));

/** true si el api_token pertenece al usuario. Lo llaman las RPC que reciben id + api_token. */
create function private.is_owner(p_user_id uuid, p_token uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profile where id = p_user_id and api_token = p_token
  );
$$;

revoke execute on function private.is_owner(uuid, uuid) from public, anon, authenticated;
