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
    <Card tone="navy">
      <Column gap="md">
        <Row justify="between">
          <Row gap="sm">
            <Icon name="school-outline" color="amber" size="sm" />
            <AppText variant="overline" tone="onNavyAmber">
              {overline}
            </AppText>
          </Row>
          <Badge label={levelName} tone="onNavy" />
        </Row>
        <Column gap="xs">
          <AppText variant="heading" tone="onNavy" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="caption" tone="onNavyMuted">
            {description}
          </AppText>
        </Column>
        <ProgressBar
          value={progress}
          tone="amber"
          onNavy
          accessibilityLabel={`Progreso del módulo: ${progressLabel}`}
        />
        <Row justify="between">
          <AppText variant="caption" tone="onNavy" weight="bold">
            {progressLabel}
          </AppText>
          <AppText variant="caption" tone="onNavyAmber" weight="bold">
            {percentLabel}
          </AppText>
        </Row>
      </Column>
    </Card>
  );
}
