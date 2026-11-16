-- Pruebas de reset_progress ("Reiniciar mi avance"). Ejecutar: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set salt '''0123456789abcdef0123456789abcdef'''

select r->>'user_id' as uid, r->>'api_token' as tok
  from public.register('ana@correo.com', 'Ana', 'López', 'México', 'Chiapas', null, :hash, :salt, 60000) r \gset
select r->>'user_id' as uid2, r->>'api_token' as tok2
  from public.register('beto@correo.com', 'Beto', 'Ruiz', 'México', 'Jalisco', null, :hash, :salt, 60000) r \gset
update public.profile set email_verified = true;

\set fila '''[{"quiz_id": 101, "passed": true, "best_score": 2, "attempts": 1, "passed_at": "2026-11-01T10:00:00Z", "updated_at": "2026-11-01T10:00:00Z"}]'''
select public.sync_progress(:'uid', :'tok', 0, :fila);
select public.sync_progress(:'uid2', :'tok2', 0, :fila);

select ok(has_function_privilege('anon', 'public.reset_progress(uuid, uuid)', 'execute'),
  'anon puede llamar reset_progress');
select is(public.reset_progress(:'uid', gen_random_uuid())->>'status', 'invalid_token', 'token ajeno: invalid_token');
select is((select count(*) from public.quiz_progress where user_id = :'uid')::integer, 1,
  'con token ajeno no se borra nada');

select is(public.reset_progress(:'uid', :'tok'), jsonb_build_object('status', 'ok', 'generation', 1),
  'borra el avance y sube la generación');
select is((select count(*) from public.quiz_progress where user_id = :'uid')::integer, 0, 'sin avance en la nube');
select is((select count(*) from public.quiz_progress where user_id = :'uid2')::integer, 1,
  'el avance de otros usuarios no se toca');

-- Otro teléfono con el avance de antes del reinicio (generación 0) intenta subirlo
select is(public.sync_progress(:'uid', :'tok', 0, :fila),
  jsonb_build_object('status', 'replace', 'generation', 1, 'progress', '[]'::jsonb),
  'una generación vieja no resucita el avance: replace con el avance vacío');
select is((select count(*) from public.quiz_progress where user_id = :'uid')::integer, 0,
  'replace no escribe nada');

create temp table r as select public.get_ranking(:'uid', :'tok') as res;
select is((select res->'me'->>'topics_passed' from r), '0', 'el ranking refleja el reinicio');

select * from finish();
rollback;
