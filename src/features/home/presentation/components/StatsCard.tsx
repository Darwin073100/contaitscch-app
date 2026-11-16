import { Row, StatTile, type IconName } from '@/shared/ui';

type StatsCardProps = { stats: { icon: IconName; value: string; label: string }[] };

/** Fila de 3 estadísticas: temas aprobados, nivel actual y examen final. */
export function StatsCard({ stats }: StatsCardProps) {
  return (
    <Row gap="sm" align="stretch" accessibilityLabel="Tu avance">
      {stats.map((s) => (
        <StatTile key={s.label} value={s.value} label={s.label} icon={s.icon} />
      ))}
    </Row>
  );
}
