-- Verificación de correo OPCIONAL (apagada por omisión mientras no hay proveedor de correo).
-- Un solo interruptor en el servidor; la app lo recibe en register y login:
--   update private.settings set email_verification_required = true;   -- volver a pedir el código
--
-- Con la verificación apagada:
--   * register: un correo ya registrado responde email_taken siempre (nadie puede reemplazar una
--     cuenta ajena porque esté "sin verificar").
--   * register y login devuelven verification_required = false: la app entra directo al curso.
--   * el ranking incluye a todos los participantes.
-- Con la verificación encendida todo vuelve al comportamiento original.

create table private.settings (
  id                          boolean primary key default true check (id),
  email_verification_required boolean not null default false
);
insert into private.settings default values;
revoke all on private.settings from public, anon, authenticated;

comment on table private.settings is
  'Configuración del servidor (una sola fila). email_verification_required: pedir código al registrarse.';

create function private.email_verification_required()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select email_verification_required from private.settings), false);
$$;
revoke execute on function private.email_verification_required() from public, anon, authenticated;

-- ===================== register =====================
-- Igual que 20261104000200_register.sql, salvo:
--   * solo reemplaza un registro abandonado (sin verificar) si la verificación está encendida;
--   * la respuesta ok incluye verification_required.
create or replace function public.register(
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
  v_required   boolean := private.email_verification_required();
  v_hash       text;
  v_existing   public.profile%rowtype;
  v_id         uuid;
  v_token      uuid;
begin
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
    -- Sin verificación no hay forma de saber quién es el dueño del correo: nunca se reemplaza
    if v_existing.email_verified or not v_required then
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
      return jsonb_build_object('status', 'email_taken');
    end;
  end if;

  return jsonb_build_object('status', 'ok', 'user_id', v_id, 'api_token', v_token,
                            'verification_required', v_required);
end $$;

comment on function public.register(text, text, text, text, text, text, text, text, integer) is
  'Registro sin Supabase Auth. {status: ok, user_id, api_token, verification_required} | {status: email_taken} | {status: invalid_input}.';

-- ===================== login =====================
-- Igual que 20261105000200_login.sql, más verification_required.
create or replace function public.login(p_email text, p_password_hash text)
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
    'verification_required', private.email_verification_required(),
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

-- ===================== ranking =====================
-- Igual que 20261115000300_ranking_view.sql; sin verificación participan todos.
create or replace view private.ranking as
with por_nivel as (
  select user_id, quiz_id / 100 as level_num, count(*) filter (where passed) as aprobados
    from public.quiz_progress
   where quiz_id <> 900
   group by user_id, quiz_id / 100
), totales as (
  select p.id as user_id, p.first_name, p.last_name, p.city, p.state, p.country,
         coalesce(sum(n.aprobados), 0)::integer           as topics_passed,
         count(*) filter (where n.aprobados = 4)::integer as levels_completed
    from public.profile p
    left join por_nivel n on n.user_id = p.id
   where p.email_verified or not private.email_verification_required()
   group by p.id
)
select dense_rank() over (order by levels_completed desc, topics_passed desc)::integer as position,
       t.user_id, t.first_name, t.last_name, t.city, t.state, t.country,
       t.levels_completed, t.topics_passed
  from totales t;

revoke all on private.ranking from public, anon, authenticated;
