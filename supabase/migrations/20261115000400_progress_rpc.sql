-- RPC del avance y del ranking. Todas validan id + api_token con private.is_owner y responden
-- { "status": … } sin lanzar excepciones.

-- Avance de un usuario como arreglo JSON (forma común de las respuestas).
create function private.progress_json(p_user_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'quiz_id', quiz_id,
        'passed', passed,
        'best_score', best_score,
        'attempts', attempts,
        'passed_at', passed_at,
        'updated_at', updated_at
      )
      order by quiz_id
    ),
    '[]'::jsonb
  )
  from public.quiz_progress
  where user_id = p_user_id;
$$;

revoke execute on function private.progress_json(uuid) from public, anon, authenticated;

-- Sube el avance pendiente del teléfono, lo fusiona y devuelve el avance completo del usuario.
-- Sirve para todo: subir, restaurar al iniciar sesión (con arreglo vacío) y traer lo que avanzó otro
-- teléfono. Fusión (misma regla que mergeProgress en la app; conmutativa e idempotente):
--   passed = viejo OR nuevo · best_score y attempts = el mayor · passed_at = el más antiguo
--   updated_at = el más reciente (recortado a now())
-- p_generation: la que el teléfono vio la última vez (NULL si nunca sincronizó). Si no coincide con
-- profile.progress_generation (teléfono nuevo o avance de antes de un reinicio) no se escribe nada y
-- se responde 'replace' para que el teléfono reemplace su avance local por el de la nube.
-- p_progress: [{ quiz_id, passed, best_score, attempts, passed_at, updated_at }], máximo 25 (24 + 900).
-- Respuesta:
--   { "status": "ok", "generation", "synced_at", "progress": [...] }
--   { "status": "replace", "generation", "progress": [...] }
--   { "status": "invalid_token" } | { "status": "invalid_input" }   (invalid_input: no se escribe nada)
create function public.sync_progress(
  p_user_id    uuid,
  p_token      uuid,
  p_generation integer,
  p_progress   jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generation integer;
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  -- for update: un reset_progress simultáneo espera a que termine esta subida (o al revés)
  select progress_generation into v_generation
    from public.profile where id = p_user_id for update;

  if p_generation is distinct from v_generation then
    return jsonb_build_object(
      'status', 'replace',
      'generation', v_generation,
      'progress', private.progress_json(p_user_id)
    );
  end if;

  if jsonb_typeof(p_progress) is distinct from 'array' or jsonb_array_length(p_progress) > 25 then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  begin
    insert into public.quiz_progress as cur
      (user_id, quiz_id, passed, best_score, attempts, passed_at, updated_at)
    select p_user_id,
           (r ->> 'quiz_id')::smallint,
           (r ->> 'passed')::boolean,
           (r ->> 'best_score')::smallint,
           (r ->> 'attempts')::integer,
           -- Un reloj adelantado no puede dejar fechas en el futuro
           case when r ->> 'passed_at' is not null
                then least((r ->> 'passed_at')::timestamptz, now()) end,
           least((r ->> 'updated_at')::timestamptz, now())
      from jsonb_array_elements(p_progress) r
    on conflict (user_id, quiz_id) do update set
      passed     = cur.passed or excluded.passed,
      best_score = greatest(cur.best_score, excluded.best_score),
      attempts   = greatest(cur.attempts, excluded.attempts),
      passed_at  = least(cur.passed_at, excluded.passed_at),   -- least() ignora NULL
      updated_at = greatest(cur.updated_at, excluded.updated_at);
  exception
    -- cardinality_violation: el mismo quiz_id dos veces en el lote
    when check_violation or not_null_violation or cardinality_violation
         or invalid_text_representation or invalid_datetime_format
         or datetime_field_overflow or numeric_value_out_of_range
         or invalid_parameter_value then
      -- El bloque deshace lo que alcanzó a insertar: todo o nada
      return jsonb_build_object('status', 'invalid_input');
  end;

  return jsonb_build_object(
    'status', 'ok',
    'generation', v_generation,
    'synced_at', now(),
    'progress', private.progress_json(p_user_id)
  );
end $$;

-- Ranking: los primeros p_limit (1..100) y la fila del usuario ("Tu posición"), aunque quede fuera
-- del límite. Sin correos ni ids de otros usuarios. me = null si el usuario no aparece (sin verificar).
-- Respuesta:
--   { "status": "ok", "total", "entries": [{ position, first_name, last_name, city, state, country,
--     levels_completed, topics_passed, is_me }], "me": { … } | null }
--   { "status": "invalid_token" }
create function public.get_ranking(p_user_id uuid, p_token uuid, p_limit integer default 100)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit   integer := least(greatest(coalesce(p_limit, 100), 1), 100);
  v_entries jsonb;
  v_me      jsonb;
  v_total   integer;
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  select coalesce(jsonb_agg(e.entry order by e.position, e.last_name, e.first_name), '[]'::jsonb)
    into v_entries
    from (
      select r.position, r.first_name, r.last_name,
             jsonb_build_object(
               'position', r.position,
               'first_name', r.first_name,
               'last_name', r.last_name,
               'city', r.city,
               'state', r.state,
               'country', r.country,
               'levels_completed', r.levels_completed,
               'topics_passed', r.topics_passed,
               'is_me', r.user_id = p_user_id
             ) as entry
        from private.ranking r
       order by r.position, r.last_name, r.first_name
       limit v_limit
    ) e;

  select jsonb_build_object(
           'position', r.position,
           'first_name', r.first_name,
           'last_name', r.last_name,
           'city', r.city,
           'state', r.state,
           'country', r.country,
           'levels_completed', r.levels_completed,
           'topics_passed', r.topics_passed,
           'is_me', true
         )
    into v_me
    from private.ranking r
   where r.user_id = p_user_id;

  select count(*) into v_total from private.ranking;

  return jsonb_build_object('status', 'ok', 'total', v_total, 'entries', v_entries, 'me', v_me);
end $$;

-- "Reiniciar mi avance": borra el avance del usuario en la nube y sube la generación, para que
-- ningún teléfono con el avance viejo lo vuelva a subir.
-- Respuesta: { "status": "ok", "generation" } | { "status": "invalid_token" }
create function public.reset_progress(p_user_id uuid, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generation integer;
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  update public.profile
     set progress_generation = progress_generation + 1
   where id = p_user_id
  returning progress_generation into v_generation;

  delete from public.quiz_progress where user_id = p_user_id;

  return jsonb_build_object('status', 'ok', 'generation', v_generation);
end $$;

revoke execute on function public.sync_progress(uuid, uuid, integer, jsonb) from public, anon, authenticated;
revoke execute on function public.get_ranking(uuid, uuid, integer) from public, anon, authenticated;
revoke execute on function public.reset_progress(uuid, uuid) from public, anon, authenticated;
grant execute on function public.sync_progress(uuid, uuid, integer, jsonb) to anon;
grant execute on function public.get_ranking(uuid, uuid, integer) to anon;
grant execute on function public.reset_progress(uuid, uuid) to anon;

comment on function public.sync_progress(uuid, uuid, integer, jsonb) is
  'Sube y fusiona el avance; devuelve el avance completo. {status: ok|replace|invalid_token|invalid_input}.';
comment on function public.get_ranking(uuid, uuid, integer) is
  'Ranking por niveles completados y temas aprobados, con la fila del usuario. {status: ok|invalid_token}.';
comment on function public.reset_progress(uuid, uuid) is
  'Borra el avance del usuario y sube su generación. {status: ok|invalid_token}.';
