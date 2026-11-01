import { AppText, Column, ProgressBar, Row } from '@/shared/ui';

import type { PasswordStrength } from '../forms/passwordStrength';

const levels = {
  empty: { value: 0, label: '', tone: 'danger' },
  weak: { value: 1 / 3, label: 'Débil', tone: 'danger' },
  medium: { value: 2 / 3, label: 'Media', tone: 'streak' },
  strong: { value: 1, label: 'Fuerte', tone: 'primary' },
} as const satisfies Record<
  PasswordStrength,
  { value: number; label: string; tone: 'danger' | 'streak' | 'primary' }
>;

type PasswordStrengthMeterProps = {
  strength: PasswordStrength;
};

/** Barra "Nivel de seguridad" bajo el campo de contraseña. */
export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  const level = levels[strength];
  return (
    <Column gap="xs">
      <ProgressBar
        value={level.value}
        tone={level.tone}
        size="sm"
        accessibilityLabel={`Nivel de seguridad: ${level.label || 'sin contraseña'}`}
      />
      <Row justify="between">
        <AppText variant="caption" tone={level.tone} weight="semibold">
          {level.label}
        </AppText>
        <AppText variant="caption" weight="semibold">
          Nivel de seguridad
        </AppText>
      </Row>
    </Column>
  );
}
