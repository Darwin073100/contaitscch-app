import { AppText, Badge, Column, Logo } from '@/shared/ui';

/** Encabezado común de los dos pasos del registro. */
export function RegisterHero() {
  return (
    <Column gap="lg">
      <Badge label="Registro oficial" tone="primary" size="md" uppercase />
      <Column align="center" gap="sm">
        <Logo size="lg" ring verified />
        <AppText variant="title" align="center" accessibilityRole="header">
          ¡Únete a CONTAITSCCH!
        </AppText>
        <AppText variant="caption" align="center">
          Aprende contabilidad desde cero, nivel por nivel, con un ejercicio al final de cada tema.
        </AppText>
      </Column>
    </Column>
  );
}
