import { AppText, Button, Card, Column, type IconName } from '@/shared/ui';

type NextTopicCardProps = {
  overline: string;
  title: string;
  actionLabel: string;
  actionIcon: IconName;
  retry: boolean;
  onPress: () => void;
};

/** Tarjeta navy "Tu siguiente tema" (o "Vuelve a tomar este tema" si lo reprobó). */
export function NextTopicCard({
  overline,
  title,
  actionLabel,
  actionIcon,
  retry,
  onPress,
}: NextTopicCardProps) {
  return (
    <Card tone="navy">
      <Column gap="md">
        <Column gap="xs">
          <AppText variant="overline" tone="onNavyAmber">
            {overline}
          </AppText>
          <AppText variant="heading" tone="onNavy">
            {title}
          </AppText>
        </Column>
        <Button
          label={actionLabel}
          variant="amber"
          size="sm"
          leftIcon={retry ? actionIcon : undefined}
          rightIcon={retry ? undefined : actionIcon}
          onPress={onPress}
        />
      </Column>
    </Card>
  );
}
