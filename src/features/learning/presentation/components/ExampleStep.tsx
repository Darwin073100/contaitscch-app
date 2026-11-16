import { AppText, Card, Column, NumberedList } from '@/shared/ui';

type ExampleStepProps = { title: string; steps: string[] };

/** Paso 3: caso práctico con sus pasos numerados. */
export function ExampleStep({ title, steps }: ExampleStepProps) {
  return (
    <Column gap="md">
      <AppText tone="muted">Así se aplica en un negocio real:</AppText>
      <Card>
        <Column gap="md">
          <Column gap="xs">
            <AppText variant="overline" tone="amber">
              Caso práctico
            </AppText>
            <AppText variant="heading" accessibilityRole="header">
              {title}
            </AppText>
          </Column>
          <NumberedList items={steps} />
        </Column>
      </Card>
    </Column>
  );
}
