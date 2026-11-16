import { Button, Column, IconButton, Row } from '@/shared/ui';

type LessonFooterProps = {
  canGoBack: boolean;
  primaryLabel: string;
  onPrevious: () => void;
  onNext: () => void;
};

/** Pie fijo de la lección: "<" (paso anterior) + Continuar / Ir al ejercicio. */
export function LessonFooter({ canGoBack, primaryLabel, onPrevious, onNext }: LessonFooterProps) {
  return (
    <Row gap="md">
      {canGoBack && (
        <IconButton
          icon="chevron-left"
          shape="rounded"
          size="lg"
          accessibilityLabel="Paso anterior"
          onPress={onPrevious}
        />
      )}
      <Column grow>
        <Button label={primaryLabel} rightIcon="arrow-right" onPress={onNext} />
      </Column>
    </Row>
  );
}
