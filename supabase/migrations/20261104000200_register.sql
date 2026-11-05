-- RPC register: crea el participante y devuelve id + api_token para la sesión de la app.
-- La app manda el hash PBKDF2 (hex) con su sal e iteraciones; aquí se guarda su sha256 (doble hash).
--
-- Respuesta (jsonb):
--   { "status": "ok", "user_id": uuid, "api_token": uuid }
--   { "status": "email_taken" }    el correo ya pertenece a una cuenta verificada
--   { "status": "invalid_input" }  algún dato no cumple las reglas del registro
--
-- Si el correo existe pero NO está verificado (registro abandonado), se reemplazan los datos y se
-- rota el api_token: así nadie queda bloqueado por un registro a medias. El código de verificación
-- vigente se conserva para respetar la espera de 45 s entre envíos.

create function public.register(
  p_email               text,
  p_first_name          text,
  p_last_name           text,
  p_country             text,
  p_state               text,
  p_city                text,
  p_password_hash       text,
  p_password_salt       text,
  p_password_iterations integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email      text := lower(btrim(p_email));
  v_first_name text := btrim(p_first_name);
  v_last_name  text := btrim(p_last_name);
  v_country    text := btrim(p_country);
  v_state      text := btrim(p_state);
  v_city       text := nullif(btrim(p_city), '');
  v_hash       text;
  v_existing   public.profile%rowtype;
  v_id         uuid;
  v_token      uuid;
begin
  -- Mismas reglas que el formulario de la app: cualquiera puede llamar esta RPC sin la app
  if v_email is null or char_length(v_email) < 3 or position('@' in v_email) <= 1
     or coalesce(char_length(v_first_name), 0) < 3
     or coalesce(char_length(v_last_name), 0) < 3
     or coalesce(v_country, '') = ''
     or coalesce(v_state, '') = ''
     or coalesce(p_password_hash, '') !~ '^[0-9a-f]{64}$'
     or coalesce(p_password_salt, '') !~ '^[0-9a-f]{32}$'
     or p_password_iterations is null
     or p_password_iterations not between 10000 and 1000000
  then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  v_hash := encode(extensions.digest(p_password_hash, 'sha256'), 'hex');

  select * into v_existing from public.profile where email = v_email for update;

  if found then
    if v_existing.email_verified then
      return jsonb_build_object('status', 'email_taken');
    end if;

    update public.profile
       set first_name          = v_first_name,
           last_name           = v_last_name,
           country             = v_country,
           state               = v_state,
           city                = v_city,
           password_hash       = v_hash,
           password_salt       = p_password_salt,
           password_iterations = p_password_iterations,
           api_token           = gen_random_uuid()
     where id = v_existing.id
    returning id, api_token into v_id, v_token;
  else
    begin
      insert into public.profile
        (email, first_name, last_name, country, state, city,
         password_hash, password_salt, password_iterations)
      values
        (v_email, v_first_name, v_last_name, v_country, v_state, v_city,
         v_hash, p_password_salt, p_password_iterations)
      returning id, api_token into v_id, v_token;
    exception when unique_violation then
      -- Otro registro con el mismo correo ganó la carrera
      return jsonb_build_object('status', 'email_taken');
    end;
  end if;

  return jsonb_build_object('status', 'ok', 'user_id', v_id, 'api_token', v_token);
end $$;

revoke execute on function public.register(text, text, text, text, text, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.register(text, text, text, text, text, text, text, text, integer)
  to anon;

comment on function public.register(text, text, text, text, text, text, text, text, integer) is
  'Registro sin Supabase Auth. Devuelve {status: ok, user_id, api_token} | {status: email_taken} | {status: invalid_input}.';
