import { AppText, Column, ProgressBar, Row, StatPill } from '@/shared/ui';

type TopicStepProgressProps = {
  stepLabel: string;
  progress: number;
  rewardLabel: string | null;
  rewardAccessibilityLabel: string | null;
};

/** "Paso 2 de 4" + XP en juego + barra de avance del tema. */
export function TopicStepProgress({
  stepLabel,
  progress,
  rewardLabel,
  rewardAccessibilityLabel,
}: TopicStepProgressProps) {
  return (
    <Column gap="sm">
      <Row justify="between">
        <AppText variant="caption" tone="default" weight="semibold">
          {stepLabel}
        </AppText>
        {rewardLabel && (
          <StatPill
            icon="lightning-bolt"
            iconColor="accent"
            value={rewardLabel}
            accessibilityLabel={rewardAccessibilityLabel ?? rewardLabel}
          />
        )}
      </Row>
      <ProgressBar value={progress} accessibilityLabel={`Avance del tema: ${stepLabel}`} />
    </Column>
  );
}
