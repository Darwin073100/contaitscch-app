import { Button, Column, IconButton, Row, type IconName } from '@/shared/ui';

type TopicStepFooterProps = {
  canGoBack: boolean;
  primaryLabel: string;
  primaryIcon: IconName;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** Pie fijo de la sesión: "<" (paso anterior) + botón principal (Continuar / Completar tema). */
export function TopicStepFooter({
  canGoBack,
  primaryLabel,
  primaryIcon,
  loading,
  onPrevious,
  onNext,
}: TopicStepFooterProps) {
  return (
    <Row gap="md">
      {canGoBack && (
        <IconButton
          icon="chevron-left"
          shape="rounded"
          size="lg"
          accessibilityLabel="Paso anterior"
          disabled={loading}
          onPress={onPrevious}
        />
      )}
      <Column grow>
        <Button label={primaryLabel} rightIcon={primaryIcon} loading={loading} onPress={onNext} />
      </Column>
    </Row>
  );
}
