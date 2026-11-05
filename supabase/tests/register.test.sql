-- Pruebas de la RPC register y de los permisos del esquema. Ejecutar: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

-- Hash PBKDF2 y sal de ejemplo (hex), como los manda la app
\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set hash2 '''bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'''
\set salt '''0123456789abcdef0123456789abcdef'''

-- ===================== Permisos =====================
select ok(has_function_privilege('anon', 'public.register(text, text, text, text, text, text, text, text, integer)', 'execute'),
  'anon puede llamar register');
select ok(not has_table_privilege('anon', 'public.profile', 'select'), 'anon no puede leer profile');
select ok(not has_table_privilege('anon', 'public.profile', 'insert'), 'anon no puede insertar en profile');
select ok(not has_table_privilege('anon', 'public.xp_event', 'select'), 'anon no puede leer xp_event');
select ok(not has_function_privilege('anon', 'public.set_updated_at()', 'execute'), 'anon no puede llamar set_updated_at');
select ok((select relrowsecurity from pg_class where oid = 'public.profile'::regclass), 'RLS activo en profile');

-- ===================== Registro nuevo =====================
create temp table r1 as
  select public.register('  Ana.Lopez@Correo.COM ', ' Ana ', 'López', 'México', 'Chiapas', '  ',
                         :hash, :salt, 60000) as res;

select is((select res->>'status' from r1), 'ok', 'registro nuevo: status ok');
select ok((select (res->>'user_id')::uuid is not null and (res->>'api_token')::uuid is not null from r1),
  'devuelve user_id y api_token');
select is((select email from public.profile), 'ana.lopez@correo.com', 'el correo se guarda en minúsculas y sin espacios');
select is((select city from public.profile), null, 'ciudad vacía se guarda como NULL');
select is((select password_hash from public.profile),
  encode(extensions.digest(:hash, 'sha256'), 'hex'), 'guarda sha256 del hash de la app (doble hash)');
select is((select email_verified from public.profile), false, 'empieza sin verificar');

-- ===================== Correo repetido =====================
create temp table r2 as
  select public.register('ana.lopez@correo.com', 'Anita', 'López', 'México', 'Chiapas', null,
                         :hash2, :salt, 60000) as res;

select is((select res->>'status' from r2), 'ok', 'correo sin verificar: se puede registrar de nuevo');
select is((select res->>'user_id' from r2), (select res->>'user_id' from r1), 'conserva el mismo id');
select isnt((select res->>'api_token' from r2), (select res->>'api_token' from r1), 'rota el api_token');
select is((select first_name from public.profile), 'Anita', 'actualiza los datos');

update public.profile set email_verified = true;
select is(public.register('ana.lopez@correo.com', 'Otra', 'Persona', 'México', 'Chiapas', null,
                          :hash, :salt, 60000)->>'status',
  'email_taken', 'correo verificado: email_taken');

-- ===================== Datos inválidos =====================
select is(public.register('sin-arroba', 'Ana', 'López', 'México', 'Chiapas', null, :hash, :salt, 60000)->>'status',
  'invalid_input', 'correo sin @: invalid_input');
select is(public.register('b@c.com', 'Al', 'López', 'México', 'Chiapas', null, :hash, :salt, 60000)->>'status',
  'invalid_input', 'nombre de menos de 3 caracteres: invalid_input');
select is(public.register('b@c.com', 'Ana', 'López', 'México', 'Chiapas', null, 'mi-contraseña', :salt, 60000)->>'status',
  'invalid_input', 'hash que no es hex de 64: invalid_input (la contraseña en claro nunca se acepta)');

select * from finish();
rollback;
