import { AppText, Button, Card, Column, IconBox, Row } from '@/shared/ui';

type FinalExamCardProps = {
  unlocked: boolean;
  title: string;
  detail: string;
  canTake: boolean;
  onPress: () => void;
};

/** Tarjeta del examen integrador final: bloqueado hasta aprobar los 24 temas. */
export function FinalExamCard({ unlocked, title, detail, canTake, onPress }: FinalExamCardProps) {
  return (
    <Card>
      <Row align="start" gap="md">
        <IconBox icon={unlocked ? 'medal' : 'lock'} tone={unlocked ? 'amber' : 'locked'} />
        <Column grow gap="xs">
          <AppText variant="overline">Examen integrador final</AppText>
          <AppText weight="bold">{title}</AppText>
          <AppText variant="caption">{detail}</AppText>
          {canTake && (
            <Column>
              <Button
                label="Presentar examen"
                variant="amber"
                size="sm"
                leftIcon="pencil-outline"
                onPress={onPress}
              />
            </Column>
          )}
        </Column>
      </Row>
    </Card>
  );
}
