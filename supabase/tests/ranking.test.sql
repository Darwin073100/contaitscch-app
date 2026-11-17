-- Pruebas de la vista private.ranking y de get_ranking. Ejecutar: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- Base aislada: se vacía dentro de la transacción y el rollback final restaura los datos locales
truncate public.profile cascade;

\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set salt '''0123456789abcdef0123456789abcdef'''

select r->>'user_id' as ana, r->>'api_token' as ana_tok
  from public.register('ana@correo.com', 'Ana', 'López', 'México', 'Chiapas', 'Tuxtla', :hash, :salt, 60000) r \gset
select r->>'user_id' as beto
  from public.register('beto@correo.com', 'Beto', 'Ruiz', 'México', 'Jalisco', null, :hash, :salt, 60000) r \gset
select r->>'user_id' as eva
  from public.register('eva@correo.com', 'Eva', 'Soto', 'México', 'Puebla', null, :hash, :salt, 60000) r \gset
select r->>'user_id' as carla, r->>'api_token' as carla_tok
  from public.register('carla@correo.com', 'Carla', 'Vega', 'Perú', 'Lima', null, :hash, :salt, 60000) r \gset
select r->>'user_id' as dani, r->>'api_token' as dani_tok
  from public.register('dani@correo.com', 'Dani', 'Mora', 'México', 'Sonora', null, :hash, :salt, 60000) r \gset

-- Dani no verificó su correo: no participa en el ranking
update public.profile set email_verified = true where id <> :'dani';

-- Avance (directo en la tabla: aquí se prueba el ranking, no la sincronización)
create function pg_temp.aprobar(p_user uuid, p_quizzes integer[]) returns void language sql as $$
  insert into public.quiz_progress (user_id, quiz_id, passed, best_score, attempts, passed_at, updated_at)
  select p_user, q, true, 2, 1, now(), now() from unnest(p_quizzes) q;
$$;
select pg_temp.aprobar(:'ana', array[101, 102, 103, 104, 201]);     -- 1 nivel, 5 temas
select pg_temp.aprobar(:'beto', array[101, 102, 103, 104]);         -- 1 nivel, 4 temas
select pg_temp.aprobar(:'eva', array[101, 102, 103, 104]);          -- empate con Beto
select pg_temp.aprobar(:'carla', array[101, 102, 900]);             -- el examen no cuenta como tema
select pg_temp.aprobar(:'dani', array[101, 102, 103, 104, 201, 202]);
-- Un tema intentado sin aprobar no cuenta
insert into public.quiz_progress (user_id, quiz_id, passed, best_score, attempts, updated_at)
values (:'beto', 201, false, 1, 3, now());

-- ===================== Permisos =====================
select ok(has_function_privilege('anon', 'public.get_ranking(uuid, uuid, integer)', 'execute'),
  'anon puede llamar get_ranking');
select ok(not has_table_privilege('anon', 'private.ranking', 'select'), 'anon no puede leer la vista');
select is(public.get_ranking(:'ana', gen_random_uuid())->>'status', 'invalid_token', 'token ajeno: invalid_token');

-- ===================== Orden =====================
create temp table r as select public.get_ranking(:'ana', :'ana_tok') as res;

select is((select (res->>'total')::integer from r), 4, 'solo cuentan los correos verificados');
select is(
  (select array_agg(e->>'first_name' || ':' || (e->>'position') order by ord)
     from r, jsonb_array_elements(res->'entries') with ordinality as x(e, ord)),
  array['Ana:1', 'Beto:2', 'Eva:2', 'Carla:3'],
  'niveles primero, luego temas; los empates comparten posición (dense_rank)');
select is((select res->'entries'->0 from r),
  jsonb_build_object('position', 1, 'first_name', 'Ana', 'last_name', 'López', 'city', 'Tuxtla',
    'state', 'Chiapas', 'country', 'México', 'levels_completed', 1, 'topics_passed', 5, 'is_me', true),
  'cada fila trae nombre, ubicación, niveles, temas y si soy yo');
select is((select (res->'entries'->1->>'topics_passed')::integer from r), 4,
  'un tema intentado sin aprobar no cuenta');
select is((select res->'entries'->3->>'topics_passed' || '/' || (res->'entries'->3->>'levels_completed') from r),
  '2/0', 'el examen integrador no cuenta como tema');
select is((select res->'me'->>'position' from r), '1', 'me trae la posición del usuario');
select is((select strpos(res::text, '@') from r), 0, 'no expone correos');
select ok((select not (res->'entries'->0 ? 'user_id') from r), 'no expone ids de usuario');

-- ===================== Límite y usuarios fuera del ranking =====================
select is((select jsonb_array_length(public.get_ranking(:'carla', :'carla_tok', 1)->'entries')), 1,
  'respeta el límite');
select is(public.get_ranking(:'carla', :'carla_tok', 1)->'me'->>'position', '3',
  '"Tu posición" llega aunque quede fuera del límite');
select is(public.get_ranking(:'dani', :'dani_tok')->'me', 'null'::jsonb,
  'sin correo verificado: no aparece en el ranking');

select * from finish();
rollback;
