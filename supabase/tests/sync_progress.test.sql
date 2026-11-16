-- Pruebas de sync_progress (subida, fusión entre teléfonos, generación). Ejecutar: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set salt '''0123456789abcdef0123456789abcdef'''

select r->>'user_id' as uid, r->>'api_token' as tok
  from public.register('ana@correo.com', 'Ana', 'López', 'México', 'Chiapas', null, :hash, :salt, 60000) r \gset
select r->>'user_id' as uid2, r->>'api_token' as tok2
  from public.register('beto@correo.com', 'Beto', 'Ruiz', 'México', 'Jalisco', null, :hash, :salt, 60000) r \gset

-- Lotes de prueba. A: teléfono 1 (aprobó 101, reprobó 102). B: teléfono 2 (reprobó 101 tres veces
-- antes de sincronizar y aprobó 102 después).
create temp table lote (name text primary key, j jsonb);
insert into lote values
  ('a', '[
    {"quiz_id": 101, "passed": true,  "best_score": 2, "attempts": 1, "passed_at": "2026-11-01T10:00:00Z", "updated_at": "2026-11-01T10:00:00Z"},
    {"quiz_id": 102, "passed": false, "best_score": 1, "attempts": 2, "passed_at": null, "updated_at": "2026-11-01T11:00:00Z"}
  ]'),
  ('b', '[
    {"quiz_id": 101, "passed": false, "best_score": 1, "attempts": 3, "passed_at": null, "updated_at": "2026-11-03T10:00:00Z"},
    {"quiz_id": 102, "passed": true,  "best_score": 2, "attempts": 1, "passed_at": "2026-11-02T10:00:00Z", "updated_at": "2026-11-02T10:00:00Z"}
  ]');

-- ===================== Permisos =====================
select ok(has_function_privilege('anon', 'public.sync_progress(uuid, uuid, integer, jsonb)', 'execute'),
  'anon puede llamar sync_progress');
select ok(not has_table_privilege('anon', 'public.quiz_progress', 'select'), 'anon no puede leer quiz_progress');
select ok(not has_table_privilege('authenticated', 'public.quiz_progress', 'insert'),
  'authenticated no puede escribir quiz_progress');
select ok((select relrowsecurity from pg_class where oid = 'public.quiz_progress'::regclass),
  'RLS activo en quiz_progress');

-- ===================== Token y generación =====================
select is(public.sync_progress(:'uid', gen_random_uuid(), 0, '[]')->>'status', 'invalid_token',
  'token ajeno: invalid_token');

select is(public.sync_progress(:'uid', :'tok', null, (select j from lote where name = 'a')),
  jsonb_build_object('status', 'replace', 'generation', 0, 'progress', '[]'::jsonb),
  'teléfono que nunca sincronizó: replace con la generación y el avance de la nube');
select is((select count(*) from public.quiz_progress)::integer, 0, 'replace no escribe nada');

-- ===================== Subida =====================
create temp table r1 as select public.sync_progress(:'uid', :'tok', 0, (select j from lote where name = 'a')) as res;
select is((select res->>'status' from r1), 'ok', 'generación correcta: ok');
select is((select jsonb_array_length(res->'progress') from r1), 2, 'devuelve el avance completo');
select is((select res->'progress'->0->>'quiz_id' from r1), '101', 'el avance va ordenado por quiz_id');
select isnt((select res->>'synced_at' from r1), null, 'devuelve la hora de la sincronización');

select public.sync_progress(:'uid', :'tok', 0, (select j from lote where name = 'a'));
select is((select attempts from public.quiz_progress where user_id = :'uid' and quiz_id = 101), 1,
  'subir dos veces el mismo lote no cambia nada (idempotente)');

-- ===================== Fusión con otro teléfono =====================
select public.sync_progress(:'uid', :'tok', 0, (select j from lote where name = 'b'));

select is((select passed from public.quiz_progress where user_id = :'uid' and quiz_id = 101), true,
  'un tema aprobado nunca vuelve a reprobado');
select is((select best_score || '/' || attempts from public.quiz_progress where user_id = :'uid' and quiz_id = 101),
  '2/3', 'best_score y attempts toman el mayor');
select is((select passed_at from public.quiz_progress where user_id = :'uid' and quiz_id = 101),
  '2026-11-01T10:00:00Z'::timestamptz, 'passed_at se conserva de la primera aprobación');
select is((select passed || '/' || attempts from public.quiz_progress where user_id = :'uid' and quiz_id = 102),
  'true/2', 'lo aprobado en el otro teléfono se suma');
select is((select updated_at from public.quiz_progress where user_id = :'uid' and quiz_id = 101),
  '2026-11-03T10:00:00Z'::timestamptz, 'updated_at es el más reciente');

-- Otro usuario sube los mismos lotes en orden inverso: debe quedar igual
select public.sync_progress(:'uid2', :'tok2', 0, (select j from lote where name = 'b'));
select public.sync_progress(:'uid2', :'tok2', 0, (select j from lote where name = 'a'));
select results_eq(
  format('select quiz_id, passed, best_score, attempts, passed_at, updated_at from public.quiz_progress where user_id = %L order by quiz_id', :'uid'),
  format('select quiz_id, passed, best_score, attempts, passed_at, updated_at from public.quiz_progress where user_id = %L order by quiz_id', :'uid2'),
  'el orden de las subidas no cambia el resultado');

-- ===================== Entradas inválidas (todo o nada) =====================
select is(public.sync_progress(:'uid', :'tok', 0,
  '[{"quiz_id": 103, "passed": false, "best_score": 0, "attempts": 1, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"},
    {"quiz_id": 105, "passed": false, "best_score": 0, "attempts": 1, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"}]')->>'status',
  'invalid_input', 'quiz_id fuera del catálogo (105): invalid_input');
select is((select count(*) from public.quiz_progress where user_id = :'uid' and quiz_id = 103)::integer, 0,
  'un lote inválido no escribe nada, ni sus filas válidas');
select is(public.sync_progress(:'uid', :'tok', 0,
  '[{"quiz_id": 103, "passed": true, "best_score": 2, "attempts": 1, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"}]')->>'status',
  'invalid_input', 'aprobado sin passed_at: invalid_input');
select is(public.sync_progress(:'uid', :'tok', 0,
  '[{"quiz_id": 103, "passed": false, "best_score": "dos", "attempts": 1, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"}]')->>'status',
  'invalid_input', 'valor que no es número: invalid_input');
select is(public.sync_progress(:'uid', :'tok', 0,
  '[{"quiz_id": 103, "passed": false, "best_score": 0, "attempts": 1, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"},
    {"quiz_id": 103, "passed": false, "best_score": 1, "attempts": 2, "passed_at": null, "updated_at": "2026-11-04T10:00:00Z"}]')->>'status',
  'invalid_input', 'el mismo quiz_id dos veces en el lote: invalid_input');
select is(public.sync_progress(:'uid', :'tok', 0,
  (select jsonb_agg(jsonb_build_object('quiz_id', 101, 'passed', false, 'best_score', 0, 'attempts', 1,
     'passed_at', null, 'updated_at', '2026-11-04T10:00:00Z')) from generate_series(1, 26)))->>'status',
  'invalid_input', 'más de 25 filas: invalid_input');

-- ===================== Reloj adelantado y examen final =====================
select public.sync_progress(:'uid', :'tok', 0,
  '[{"quiz_id": 900, "passed": true, "best_score": 9, "attempts": 1, "passed_at": "2100-01-01T00:00:00Z", "updated_at": "2100-01-01T00:00:00Z"}]');
select is((select passed_at = now() and updated_at = now() from public.quiz_progress where user_id = :'uid' and quiz_id = 900),
  true, 'fechas en el futuro se recortan a now(); el examen final (900) se acepta');
select is((select count(*) from public.quiz_progress where user_id = :'uid2')::integer, 2,
  'la subida de un usuario no toca el avance de otro');

select * from finish();
rollback;
