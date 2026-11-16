import { AppText, Button, Card, Column, IconBox, Row } from '@/shared/ui';

type ContinueTopicBarProps = {
  caption: string;
  title: string;
  actionLabel: string;
  /** Tema reprobado: icono rojo de volver a tomar. */
  retry: boolean;
  onPress: () => void;
};

/** Barra fija inferior de la ruta (`Screen footer`): lleva al tema actual o al examen. */
export function ContinueTopicBar({
  caption,
  title,
  actionLabel,
  retry,
  onPress,
}: ContinueTopicBarProps) {
  return (
    <Card tone="navy" padding="sm">
      <Row gap="md">
        <IconBox icon={retry ? 'replay' : 'play-circle'} tone={retry ? 'danger' : 'amberSolid'} />
        <Column grow>
          <AppText variant="caption" tone="onNavyAmber" weight="bold" numberOfLines={1}>
            {caption}
          </AppText>
          <AppText tone="onNavy" weight="extrabold" numberOfLines={1}>
            {title}
          </AppText>
        </Column>
        <Button
          label={actionLabel}
          variant="amber"
          size="sm"
          rightIcon="arrow-right"
          onPress={onPress}
          accessibilityHint={`${caption}: ${title}`}
        />
      </Row>
    </Card>
  );
}
