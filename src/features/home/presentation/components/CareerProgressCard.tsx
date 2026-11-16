import { AppText, Card, Column, IconBox, ProgressBar, Row } from '@/shared/ui';

type CareerProgressCardProps = {
  progress: number;
  percentLabel: string;
  doneLabel: string;
  remainingLabel: string;
};

/** "Progreso del curso": temas aprobados con su ejercicio de los 24. */
export function CareerProgressCard({
  progress,
  percentLabel,
  doneLabel,
  remainingLabel,
}: CareerProgressCardProps) {
  return (
    <Card>
      <Column gap="md">
        <Row gap="md">
          <IconBox icon="chart-line" tone="accent" />
          <Column grow>
            <AppText variant="subtitle" weight="extrabold">
              Progreso del curso
            </AppText>
            <AppText variant="caption">Temas aprobados con su ejercicio</AppText>
          </Column>
          <AppText variant="stat" tone="accent">
            {percentLabel}
          </AppText>
        </Row>
        <ProgressBar value={progress} accessibilityLabel={`Progreso del curso: ${doneLabel}`} />
        <Row justify="between">
          <AppText variant="caption" tone="default" weight="bold">
            {doneLabel}
          </AppText>
          <AppText variant="caption" weight="bold">
            {remainingLabel}
          </AppText>
        </Row>
      </Column>
    </Card>
  );
}
