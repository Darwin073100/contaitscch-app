-- Pruebas de get_login_params y login. Ejecutar: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set salt '''0123456789abcdef0123456789abcdef'''

select public.register('ana@correo.com', 'Ana', 'López', 'México', 'Chiapas', null, :hash, :salt, 75000) as reg \gset

-- ===================== Permisos =====================
select ok(has_function_privilege('anon', 'public.get_login_params(text)', 'execute'), 'anon puede llamar get_login_params');
select ok(has_function_privilege('anon', 'public.login(text, text)', 'execute'), 'anon puede llamar login');
select ok(not has_schema_privilege('anon', 'private', 'usage'), 'anon no puede usar el esquema private');

-- ===================== get_login_params =====================
select is(public.get_login_params('ana@correo.com'),
  jsonb_build_object('salt', :salt, 'iterations', 75000), 'correo registrado: su sal y sus iteraciones');
select is(public.get_login_params('  ANA@Correo.com ')->>'salt', :salt, 'no distingue mayúsculas ni espacios');
select matches(public.get_login_params('nadie@correo.com')->>'salt', '^[0-9a-f]{32}$',
  'correo inexistente: sal falsa con el mismo formato');
select is(public.get_login_params('nadie@correo.com'), public.get_login_params('nadie@correo.com'),
  'la sal falsa es estable (no revela que el correo no existe)');
select isnt(public.get_login_params('nadie@correo.com')->>'salt', public.get_login_params('otro@correo.com')->>'salt',
  'cada correo inexistente tiene su propia sal falsa');

-- ===================== login =====================
create temp table l as select public.login('Ana@Correo.com', :hash) as res;

select is((select res->>'status' from l), 'ok', 'contraseña correcta: ok');
select is((select res->>'user_id' from l), :'reg'::jsonb->>'user_id', 'devuelve el id del registro');
select is((select res->>'api_token' from l), :'reg'::jsonb->>'api_token',
  'no rota el api_token (no cierra la sesión en otros dispositivos)');
select is((select res->'profile'->>'first_name' from l) || '|' || (select res->>'email_verified' from l),
  'Ana|false', 'devuelve el perfil y si el correo está verificado');
select is(public.login('ana@correo.com', repeat('b', 64)), public.login('nadie@correo.com', :hash),
  'contraseña incorrecta y correo inexistente dan la misma respuesta');

select * from finish();
rollback;
