-- Refactorización v2 (cliente): ya no hay XP ni racha. El avance se guarda por ejercicio en
-- quiz_progress (siguiente migración). Sin usuarios en producción: los datos de prueba se pierden.

drop table public.xp_event;
drop table public.daily_activity;

-- Solo servía para calcular "hoy" en la racha del ranking
alter table public.profile drop column timezone;

-- Sube en cada "Reiniciar mi avance": un teléfono que aún tiene el avance borrado trae una
-- generación vieja y sync_progress no lo deja subir (le responde 'replace').
alter table public.profile
  add column progress_generation integer not null default 0 check (progress_generation >= 0);

comment on table public.profile is
  'Un participante. Temas aprobados, niveles completados y posición se calculan desde quiz_progress.';
comment on column public.profile.progress_generation is
  'Generación del avance: sube en cada reinicio para que otro teléfono no resucite el avance borrado.';
