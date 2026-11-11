-- =====================================================================
-- CONTAITSCCH · Esquema de Supabase
-- En la nube solo viven los usuarios y las lecciones que cada uno ha
-- cursado. El contenido (lecciones, ejercicios, examen) está en el teléfono.
-- Ejecutar en Supabase → SQL Editor.
-- =====================================================================

-- 1) Perfil del alumno (datos del registro). El correo y la contraseña
--    los guarda Supabase Auth en auth.users.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(trim(nombre)) >= 3),
  apellidos   text not null check (char_length(trim(apellidos)) >= 3),
  pais        text not null check (char_length(trim(pais)) > 0),
  estado      text not null check (char_length(trim(estado)) > 0),
  ciudad      text,
  created_at  timestamptz not null default now()
);

-- 2) Lecciones cursadas: una fila por alumno y tema (ej. 'N2-L3').
create table if not exists public.lesson_progress (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  lesson_id   text not null check (lesson_id ~ '^N[1-6]-L[1-4]$'),
  level_num   smallint not null check (level_num between 1 and 6),
  passed      boolean not null default false,
  best_score  smallint not null default 0,
  attempts    integer not null default 0,
  passed_at   timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- 3) Crear el perfil automáticamente al registrarse.
--    La app llama: supabase.auth.signUp({ email, password,
--      options: { data: { nombre, apellidos, pais, estado, ciudad } } })
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nombre, apellidos, pais, estado, ciudad)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'apellidos',
    new.raw_user_meta_data ->> 'pais',
    new.raw_user_meta_data ->> 'estado',
    nullif(new.raw_user_meta_data ->> 'ciudad', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Seguridad: cada alumno solo lee y escribe lo suyo.
alter table public.profiles        enable row level security;
alter table public.lesson_progress enable row level security;

create policy "perfil propio: leer"       on public.profiles for select using (auth.uid() = id);
create policy "perfil propio: actualizar" on public.profiles for update using (auth.uid() = id);

create policy "progreso propio: leer"     on public.lesson_progress for select using (auth.uid() = user_id);
create policy "progreso propio: insertar" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "progreso propio: actualizar" on public.lesson_progress for update using (auth.uid() = user_id);

-- 5) Ranking: más niveles completados primero; si empatan, más temas aprobados.
--    Un nivel cuenta como completado cuando sus 4 temas están aprobados.
--    La vista expone solo nombre, ubicación y conteos (nunca correos).
create or replace view public.ranking as
with por_nivel as (
  select user_id, level_num, count(*) filter (where passed) as aprobados
  from public.lesson_progress
  group by user_id, level_num
), totales as (
  select p.id as user_id, p.nombre, p.apellidos, p.estado, p.pais, p.ciudad,
         coalesce(sum(n.aprobados), 0)::int                       as temas_aprobados,
         count(*) filter (where n.aprobados = 4)::int             as niveles_completados
  from public.profiles p
  left join por_nivel n on n.user_id = p.id
  group by p.id
)
select dense_rank() over (order by niveles_completados desc, temas_aprobados desc) as posicion,
       user_id, nombre, apellidos, estado, pais, ciudad, niveles_completados, temas_aprobados
from totales
order by posicion, nombre;

-- La vista corre con permisos de su dueño para poder mostrar a todos los
-- alumnos; por eso solo se permite a usuarios con sesión iniciada.
revoke all on public.ranking from anon;
grant select on public.ranking to authenticated;

-- =====================================================================
-- Llamadas desde la app (supabase-js):
--
-- Registro (paso 1):  supabase.auth.signUp({ email, password, options: { data: {...} } })
-- Verificación (paso 2): supabase.auth.verifyOtp({ email, token: "123456", type: "signup" })
--   (en Authentication → Email Templates, incluir {{ .Token }} para enviar el código de 6 dígitos)
-- Inicio de sesión:   supabase.auth.signInWithPassword({ email, password })
--
-- Al terminar el ejercicio de un tema (función cloud.saveLesson en la app):
--   supabase.from("lesson_progress").upsert({
--     user_id: session.user.id, lesson_id: "N1-L2", level_num: 1,
--     passed: true, best_score: 2, attempts: 3, passed_at: new Date().toISOString(),
--     updated_at: new Date().toISOString() })
--
-- Pantalla de ranking (función rankingEntries en la app):
--   supabase.from("ranking").select("*").limit(100)
-- =====================================================================
