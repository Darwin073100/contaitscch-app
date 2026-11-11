import { AppText, Column, ProgressBar } from '@/shared/ui';

type TopicStepProgressProps = {
  stepLabel: string;
  progress: number;
};

/** "Paso 2 de 4" + barra de avance del tema. */
export function TopicStepProgress({ stepLabel, progress }: TopicStepProgressProps) {
  return (
    <Column gap="sm">
      <AppText variant="caption" tone="default" weight="semibold">
        {stepLabel}
      </AppText>
      <ProgressBar value={progress} accessibilityLabel={`Avance del tema: ${stepLabel}`} />
    </Column>
  );
}
