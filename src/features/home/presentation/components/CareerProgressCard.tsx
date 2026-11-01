import { AppText, Card, Column, IconBox, ProgressBar, Row } from '@/shared/ui';

type CareerProgressCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  percentLabel: string;
  completedLabel: string;
  xpTodayLabel: string;
};

/** "Progreso de la Carrera": avance de todos los niveles y XP ganado hoy. */
export function CareerProgressCard({
  title,
  subtitle,
  progress,
  percentLabel,
  completedLabel,
  xpTodayLabel,
}: CareerProgressCardProps) {
  return (
    <Card padding="lg">
      <Column gap="md">
        <Row gap="md">
          <IconBox icon="chart-timeline-variant-shimmer" tone="primarySoft" />
          <Column grow>
            <AppText variant="subtitle" weight="bold">
              {title}
            </AppText>
            <AppText variant="caption">{subtitle}</AppText>
          </Column>
          <AppText variant="stat" tone="primary">
            {percentLabel}
          </AppText>
        </Row>
        <ProgressBar value={progress} size="lg" accessibilityLabel={title} />
        <Row justify="between">
          <AppText variant="caption" weight="semibold">
            {completedLabel}
          </AppText>
          <AppText variant="caption" tone="accent" weight="bold">
            {xpTodayLabel}
          </AppText>
        </Row>
      </Column>
    </Card>
  );
}
