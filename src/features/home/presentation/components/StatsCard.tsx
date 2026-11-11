import { Card, Row, StatTile } from '@/shared/ui';

type StatsCardProps = { topicsLabel: string; levelName: string };

/** Fila de estadísticas: temas completados y nivel actual. */
export function StatsCard({ topicsLabel, levelName }: StatsCardProps) {
  return (
    <Card padding="sm">
      <Row gap="sm">
        <StatTile value={topicsLabel} label="Temas" icon="check-circle-outline" />
        <StatTile value={levelName} label="Nivel" icon="school-outline" />
      </Row>
    </Card>
  );
}
