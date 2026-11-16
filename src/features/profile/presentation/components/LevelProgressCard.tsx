import { AppText, Card, Column, ProgressBar, Row } from '@/shared/ui';

type LevelProgressCardProps = {
  levels: { id: number; label: string; progress: number; count: string }[];
  examLine: string;
};

/** Avance por nivel (barra por nivel) y estado del examen integrador. */
export function LevelProgressCard({ levels, examLine }: LevelProgressCardProps) {
  return (
    <Card>
      <Column gap="md">
        <AppText variant="overline">Avance por nivel</AppText>
        {levels.map((l) => (
          <Row key={l.id} gap="md">
            <AppText variant="caption" tone="default" weight="bold">
              {l.label}
            </AppText>
            <Column grow>
              <ProgressBar
                value={l.progress}
                size="sm"
                accessibilityLabel={`${l.label}: ${l.count} temas`}
              />
            </Column>
            <AppText variant="caption" weight="bold">
              {l.count}
            </AppText>
          </Row>
        ))}
        <AppText variant="caption">{examLine}</AppText>
      </Column>
    </Card>
  );
}
