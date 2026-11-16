import { AppText, Card, Column, IconBox, IconButton, Row } from '@/shared/ui';

type TipCardProps = {
  kind: string;
  text: string;
  detail: string;
  onNext: () => void;
};

/** Frase o tip contable del día, con botón para ver otro. */
export function TipCard({ kind, text, detail, onNext }: TipCardProps) {
  return (
    <Card tone="flat">
      <Row align="start" gap="md">
        <IconBox icon="lightbulb-on-outline" tone="amber" />
        <Column grow gap="xs">
          <AppText variant="overline">{kind}</AppText>
          <AppText weight="bold">{text}</AppText>
          <AppText variant="caption">{detail}</AppText>
        </Column>
        <IconButton icon="refresh" accessibilityLabel="Mostrar otra frase" onPress={onNext} />
      </Row>
    </Card>
  );
}
