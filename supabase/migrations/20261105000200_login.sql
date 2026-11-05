-- RPC de inicio de sesión (sin Supabase Auth). Flujo en la app:
--   1. get_login_params(email)  → sal + iteraciones
--   2. la app calcula PBKDF2(contraseña, sal, iteraciones) en el teléfono
--   3. login(email, hash)       → id, api_token y perfil

-- Sal e iteraciones del usuario. Si el correo no existe devuelve una sal falsa pero estable
-- (HMAC del correo con el secreto del servidor): la respuesta no revela qué correos están registrados.
-- Respuesta: { "salt": text, "iterations": integer }
create function public.get_login_params(p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email      text := lower(btrim(coalesce(p_email, '')));
  v_salt       text;
  v_iterations integer;
begin
  select password_salt, password_iterations into v_salt, v_iterations
    from public.profile where email = v_email;

  if not found then
    select left(encode(extensions.hmac(v_email, value, 'sha256'), 'hex'), 32), 60000
      into v_salt, v_iterations
      from private.app_secret;
  end if;

  return jsonb_build_object('salt', v_salt, 'iterations', v_iterations);
end $$;

-- Compara el doble hash. Correo inexistente o contraseña incorrecta dan la MISMA respuesta.
-- No rota el api_token: así no se cierra la sesión en los otros dispositivos del usuario.
-- Respuesta:
--   { "status": "ok", "user_id", "api_token", "email_verified", "profile": { email, first_name, ... } }
--   { "status": "invalid_credentials" }
-- Con email_verified = false la app debe llevar a la pantalla de verificación.
create function public.login(p_email text, p_password_hash text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v public.profile%rowtype;
begin
  select * into v
    from public.profile
   where email = lower(btrim(coalesce(p_email, '')))
     and password_hash = encode(extensions.digest(coalesce(p_password_hash, ''), 'sha256'), 'hex');

  if not found then
    return jsonb_build_object('status', 'invalid_credentials');
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'user_id', v.id,
    'api_token', v.api_token,
    'email_verified', v.email_verified,
    'profile', jsonb_build_object(
      'email', v.email,
      'first_name', v.first_name,
      'last_name', v.last_name,
      'country', v.country,
      'state', v.state,
      'city', v.city
    )
  );
end $$;

revoke execute on function public.get_login_params(text) from public, anon, authenticated;
revoke execute on function public.login(text, text) from public, anon, authenticated;
grant execute on function public.get_login_params(text) to anon;
grant execute on function public.login(text, text) to anon;
