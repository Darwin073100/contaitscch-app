import { AppText, Column } from '@/shared/ui';

type GreetingHeaderProps = { overline: string; title: string; subtitle: string };

/** "Portal académico ITSCCH · Hola, Ana · Sigue con tu ruta de contabilidad." */
export function GreetingHeader({ overline, title, subtitle }: GreetingHeaderProps) {
  return (
    <Column gap="xs">
      <AppText variant="overline">{overline}</AppText>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <AppText tone="muted">{subtitle}</AppText>
    </Column>
  );
}
