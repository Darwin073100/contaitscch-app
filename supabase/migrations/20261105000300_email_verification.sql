-- Código de verificación de correo: Postgres lo genera, la Edge Function send-verification lo envía
-- con la API de Gmail y verify_email lo valida. La app nunca recibe el código en claro.

-- Genera un código de 6 dígitos (vence en 10 min, 45 s entre envíos) y guarda solo su hash.
-- SOLO service_role (la Edge Function): es la única función que devuelve el código en claro.
-- Respuesta:
--   { "status": "ok", "email", "code", "resend_in_seconds": 45 }
--   { "status": "invalid_token" } | { "status": "already_verified" }
--   { "status": "cooldown", "retry_in_seconds": n }
create function public.create_verification_code(p_user_id uuid, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email     text;
  v_verified  boolean;
  v_last_sent timestamptz;
  v_wait      integer;
  v_number    integer;
  v_code      text;
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  select email, email_verified into v_email, v_verified from public.profile where id = p_user_id;
  if v_verified then
    return jsonb_build_object('status', 'already_verified');
  end if;

  select last_sent_at into v_last_sent
    from public.email_verification where profile_id = p_user_id for update;
  v_wait := ceil(extract(epoch from (v_last_sent + interval '45 seconds' - now())))::integer;
  if v_wait > 0 then
    return jsonb_build_object('status', 'cooldown', 'retry_in_seconds', v_wait);
  end if;

  -- 6 dígitos uniformes con el generador criptográfico (no random()):
  -- 3 bytes (0..16 777 215) y se descartan los >= 16 000 000 para que % 1 000 000 no tenga sesgo
  loop
    v_number := ('x' || encode(extensions.gen_random_bytes(3), 'hex'))::bit(24)::integer;
    exit when v_number < 16000000;
  end loop;
  v_code := lpad((v_number % 1000000)::text, 6, '0');

  insert into public.email_verification (profile_id, code_hash, expires_at, attempts, last_sent_at)
  values (p_user_id, encode(extensions.digest(v_code, 'sha256'), 'hex'),
          now() + interval '10 minutes', 0, now())
  on conflict (profile_id) do update
    set code_hash    = excluded.code_hash,
        expires_at   = excluded.expires_at,
        attempts     = 0,
        last_sent_at = excluded.last_sent_at;

  return jsonb_build_object('status', 'ok', 'email', v_email, 'code', v_code, 'resend_in_seconds', 45);
end $$;

-- Valida el código. Máximo 5 intentos fallidos por código; vence a los 10 minutos.
-- Respuesta (text): ok | invalid_token | no_code | expired | too_many_attempts | invalid_code
-- Si el correo ya estaba verificado responde ok (reintentar tras un corte de red no es un error).
create function public.verify_email(p_user_id uuid, p_token uuid, p_code text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.email_verification%rowtype;
begin
  if not private.is_owner(p_user_id, p_token) then
    return 'invalid_token';
  end if;

  if (select email_verified from public.profile where id = p_user_id) then
    return 'ok';
  end if;

  select * into v from public.email_verification where profile_id = p_user_id for update;
  if not found then return 'no_code'; end if;
  if v.expires_at < now() then return 'expired'; end if;
  if v.attempts >= 5 then return 'too_many_attempts'; end if;

  if v.code_hash <> encode(extensions.digest(btrim(coalesce(p_code, '')), 'sha256'), 'hex') then
    update public.email_verification set attempts = attempts + 1 where profile_id = p_user_id;
    return 'invalid_code';
  end if;

  update public.profile set email_verified = true where id = p_user_id;
  delete from public.email_verification where profile_id = p_user_id;
  return 'ok';
end $$;

revoke execute on function public.create_verification_code(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.verify_email(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_verification_code(uuid, uuid) to service_role;
grant execute on function public.verify_email(uuid, uuid, text) to anon;
