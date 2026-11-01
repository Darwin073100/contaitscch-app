import { AppText, Button, Card, Column, IconBox, Row } from '@/shared/ui';

type ContinueTopicBarProps = {
  caption: string;
  title: string;
  actionLabel: string;
  onPress: () => void;
};

/** Barra fija inferior del temario (`Screen footer`): lleva al tema activo o al examen. */
export function ContinueTopicBar({ caption, title, actionLabel, onPress }: ContinueTopicBarProps) {
  return (
    <Card padding="sm">
      <Row gap="md">
        <IconBox icon="play-circle-outline" tone="accent" />
        <Column grow>
          <AppText variant="caption" tone="default" weight="semibold" numberOfLines={1}>
            {caption}
          </AppText>
          <AppText variant="subtitle" weight="bold" numberOfLines={1}>
            {title}
          </AppText>
        </Column>
        <Button
          label={actionLabel}
          size="sm"
          rightIcon="arrow-right"
          onPress={onPress}
          accessibilityHint={`${caption}: ${title}`}
        />
      </Row>
    </Card>
  );
}
