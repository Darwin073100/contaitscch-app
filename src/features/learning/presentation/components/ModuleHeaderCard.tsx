import { AppText, Badge, Card, Column, Icon, ProgressBar, Row } from '@/shared/ui';

type ModuleHeaderCardProps = {
  overline: string;
  levelName: string;
  title: string;
  description: string;
  /** Avance de 0 a 1. */
  progress: number;
  progressLabel: string;
  percentLabel: string;
};

/** Tarjeta superior del temario: módulo, nivel y barra de progreso. */
export function ModuleHeaderCard({
  overline,
  levelName,
  title,
  description,
  progress,
  progressLabel,
  percentLabel,
}: ModuleHeaderCardProps) {
  return (
    <Card padding="lg">
      <Column gap="md">
        <Row justify="between">
          <Row gap="sm">
            <Icon name="school-outline" color="primary" size="sm" />
            <AppText variant="overline" tone="primary">
              {overline}
            </AppText>
          </Row>
          <Badge label={levelName} appearance="solid" />
        </Row>
        <Column gap="xs">
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="caption">{description}</AppText>
        </Column>
        <ProgressBar
          value={progress}
          size="lg"
          accessibilityLabel={`Progreso del módulo: ${progressLabel}`}
        />
        <Row justify="between">
          <AppText variant="caption" tone="primary" weight="bold">
            {progressLabel}
          </AppText>
          <AppText variant="caption" tone="accent" weight="bold">
            {percentLabel}
          </AppText>
        </Row>
      </Column>
    </Card>
  );
}
