-- Ranking: más niveles completados primero; si empatan, más temas aprobados (dense_rank: los
-- empates comparten posición). Un nivel cuenta como completado con sus 4 temas aprobados; el
-- examen integrador (900) no cuenta como tema. Solo participan correos verificados.
-- Vive en private (la API no lo expone): solo lo lee get_ranking. Nunca expone correos.

create view private.ranking as
with por_nivel as (
  select user_id, quiz_id / 100 as level_num, count(*) filter (where passed) as aprobados
    from public.quiz_progress
   where quiz_id <> 900
   group by user_id, quiz_id / 100
), totales as (
  select p.id as user_id, p.first_name, p.last_name, p.city, p.state, p.country,
         coalesce(sum(n.aprobados), 0)::integer           as topics_passed,
         count(*) filter (where n.aprobados = 4)::integer as levels_completed
    from public.profile p
    left join por_nivel n on n.user_id = p.id
   where p.email_verified
   group by p.id
)
select dense_rank() over (order by levels_completed desc, topics_passed desc)::integer as position,
       t.user_id, t.first_name, t.last_name, t.city, t.state, t.country,
       t.levels_completed, t.topics_passed
  from totales t;

revoke all on private.ranking from public, anon, authenticated;

comment on view private.ranking is
  'Posición por niveles completados y temas aprobados. Solo la lee get_ranking (security definer).';
