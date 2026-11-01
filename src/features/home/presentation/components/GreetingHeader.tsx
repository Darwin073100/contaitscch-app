import { AppText, Column, Logo, Row } from '@/shared/ui';

type GreetingHeaderProps = { overline: string; title: string; subtitle: string };

/** Saludo con logotipo verificado: "PORTAL ACADÉMICO ITSSCH · ¡Hola, Contador!". */
export function GreetingHeader({ overline, title, subtitle }: GreetingHeaderProps) {
  return (
    <Row gap="lg">
      <Logo verified />
      <Column grow gap="xs">
        <AppText variant="overline" tone="primary">
          {overline}
        </AppText>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        <AppText tone="muted">{subtitle}</AppText>
      </Column>
    </Row>
  );
}
