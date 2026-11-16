import { AppText, Button, Card, Column, Row } from '@/shared/ui';

type ConfirmCardProps = {
  title: string;
  text: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmación en línea de una acción destructiva (reiniciar avance, salir con pendientes). */
export function ConfirmCard({
  title,
  text,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: ConfirmCardProps) {
  return (
    <Card tone="warn">
      <Column gap="md" accessibilityRole="alert">
        <AppText variant="subtitle" weight="extrabold">
          {title}
        </AppText>
        <AppText tone="muted">{text}</AppText>
        <Row gap="md">
          <Column grow>
            <Button label="Cancelar" variant="ghost" size="md" disabled={busy} onPress={onCancel} />
          </Column>
          <Column grow>
            <Button
              label={confirmLabel}
              variant="danger"
              size="md"
              loading={busy}
              onPress={onConfirm}
            />
          </Column>
        </Row>
      </Column>
    </Card>
  );
}
