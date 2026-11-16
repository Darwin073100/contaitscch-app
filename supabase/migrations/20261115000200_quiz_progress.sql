-- Avance por alumno y ejercicio: quiz_id = id del tema (nivel×100 + orden, 101..604) o 900 (examen
-- integrador). Equivale al lesson_progress del esquema del cliente, más el examen final.
-- Solo se escribe con sync_progress, que fusiona: aprobar nunca se deshace.

create table public.quiz_progress (
  user_id     uuid        not null references public.profile (id) on delete cascade,
  quiz_id     smallint    not null,
  passed      boolean     not null default false,
  best_score  smallint    not null default 0,
  attempts    integer     not null default 0,
  passed_at   timestamptz,
  updated_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, quiz_id),
  -- Catálogo permitido: 6 niveles × 4 temas y el examen integrador (los ids del contenido son inmutables)
  constraint quiz_progress_quiz_id check (
    quiz_id = 900 or (quiz_id / 100 between 1 and 6 and quiz_id % 100 between 1 and 4)
  ),
  constraint quiz_progress_counts check (best_score between 0 and 20 and attempts >= 0),
  constraint quiz_progress_passed check (not passed or (passed_at is not null and attempts > 0))
);

alter table public.quiz_progress enable row level security;
revoke all on public.quiz_progress from anon, authenticated;

comment on table public.quiz_progress is
  'Avance por ejercicio: aprobado, mejor puntaje e intentos. Se fusiona entre teléfonos con sync_progress.';
comment on column public.quiz_progress.attempts is
  'El mayor número de intentos visto en un teléfono (no la suma entre teléfonos).';
comment on column public.quiz_progress.updated_at is
  'Último cambio según el teléfono, recortado a now() para que un reloj adelantado no gane siempre.';
