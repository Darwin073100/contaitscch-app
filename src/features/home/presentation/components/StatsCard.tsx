import { Card, Row, StatTile } from '@/shared/ui';

type StatsCardProps = { streak: number; xp: number; levelName: string };

/** Fila de 3 estadísticas: racha, XP y nivel actual. */
export function StatsCard({ streak, xp, levelName }: StatsCardProps) {
  return (
    <Card padding="sm">
      <Row gap="sm">
        <StatTile value={streak} label="Racha" />
        <StatTile value={xp} label="XP" />
        <StatTile value={levelName} label="Nivel" icon="school-outline" />
      </Row>
    </Card>
  );
}
