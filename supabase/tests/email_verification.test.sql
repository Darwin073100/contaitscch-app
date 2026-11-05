-- Pruebas de create_verification_code y verify_email. Ejecutar: npx supabase test db
-- Dentro de la transacción now() no avanza: el tiempo se simula moviendo last_sent_at y expires_at.
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set salt '''0123456789abcdef0123456789abcdef'''

select r->>'user_id' as uid, r->>'api_token' as tok
  from public.register('ana@correo.com', 'Ana', 'López', 'México', 'Chiapas', null, :hash, :salt, 60000) r \gset

-- ===================== Permisos =====================
select ok(not has_function_privilege('anon', 'public.create_verification_code(uuid, uuid)', 'execute'),
  'anon NO puede generar códigos (solo la Edge Function)');
select ok(has_function_privilege('service_role', 'public.create_verification_code(uuid, uuid)', 'execute'),
  'service_role puede generar códigos');
select ok(has_function_privilege('anon', 'public.verify_email(uuid, uuid, text)', 'execute'), 'anon puede verificar');

-- ===================== create_verification_code =====================
select is(public.create_verification_code(:'uid', gen_random_uuid())->>'status', 'invalid_token',
  'token ajeno: invalid_token');

select r->>'status' as st, r->>'code' as code, r->>'email' as email
  from public.create_verification_code(:'uid', :'tok') r \gset
select is(:'st'::text || '|' || :'email', 'ok|ana@correo.com', 'genera el código para el correo del usuario');
select matches(:'code'::text, '^[0-9]{6}$', 'el código tiene 6 dígitos');
select is((select code_hash from public.email_verification), encode(extensions.digest(:'code', 'sha256'), 'hex'),
  'guarda solo el hash del código');

select r->>'status' as st, (r->>'retry_in_seconds')::int as wait
  from public.create_verification_code(:'uid', :'tok') r \gset
select ok(:'st' = 'cooldown' and :wait between 1 and 45, 'reenviar antes de 45 s: cooldown con segundos restantes');

-- ===================== verify_email: errores =====================
select is(public.verify_email(:'uid', gen_random_uuid(), :'code'), 'invalid_token', 'token ajeno: invalid_token');
select is(public.verify_email(:'uid', :'tok', 'abc'), 'invalid_code', 'código incorrecto: invalid_code');
select is((select attempts from public.email_verification), 1, 'cuenta el intento fallido');

select public.verify_email(:'uid', :'tok', 'abc') from generate_series(1, 4);
select is(public.verify_email(:'uid', :'tok', :'code'), 'too_many_attempts',
  'tras 5 fallos ni el código correcto pasa: too_many_attempts');

-- Pasan 45 s: se pide otro código y los intentos vuelven a 0
update public.email_verification set last_sent_at = now() - interval '1 minute';
select r->>'code' as code from public.create_verification_code(:'uid', :'tok') r \gset
select is((select attempts from public.email_verification), 0, 'un código nuevo reinicia los intentos');

update public.email_verification set expires_at = now() - interval '1 second';
select is(public.verify_email(:'uid', :'tok', :'code'), 'expired', 'después de 10 min: expired');

-- ===================== verify_email: éxito =====================
update public.email_verification set last_sent_at = now() - interval '1 minute';
select r->>'code' as code from public.create_verification_code(:'uid', :'tok') r \gset
select is(public.verify_email(:'uid', :'tok', ' ' || :'code' || ' '), 'ok', 'código correcto (con espacios): ok');
select is((select email_verified from public.profile), true, 'marca el correo como verificado');
select is((select count(*)::int from public.email_verification), 0, 'borra el código para que no se reutilice');
select is(public.verify_email(:'uid', :'tok', '000000'), 'ok', 'ya verificado: ok (reintento seguro)');
select is(public.create_verification_code(:'uid', :'tok')->>'status', 'already_verified',
  'ya verificado: no genera más códigos');

select * from finish();
rollback;
