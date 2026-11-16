import { AppText, Avatar, Button, Card, Column, Row } from '@/shared/ui';

type MyRankBarProps = {
  position: string;
  caption: string;
  message: string;
  onStudy: () => void;
};

/** Barra fija "Tu posición": #4 · 2 niveles · 9 temas · "4 temas para el podio" · Estudiar. */
export function MyRankBar({ position, caption, message, onStudy }: MyRankBarProps) {
  return (
    <Card tone="navy" padding="sm">
      <Row gap="md">
        <Avatar
          label={position}
          tone="amber"
          size="md"
          accessibilityLabel={`Tu posición ${position}`}
        />
        <Column grow>
          <AppText variant="caption" tone="onNavyAmber" weight="bold" numberOfLines={1}>
            {caption}
          </AppText>
          <AppText tone="onNavy" weight="extrabold" numberOfLines={1}>
            {message}
          </AppText>
        </Column>
        <Button
          label="Estudiar"
          variant="amber"
          size="sm"
          rightIcon="arrow-right"
          onPress={onStudy}
        />
      </Row>
    </Card>
  );
}
