import { Fragment } from 'react';

import type { ColorToken } from '@/shared/theme';
import { AppText, Card, Column, Divider, Icon, Row, type IconName } from '@/shared/ui';

// Cada beneficio en dos renglones, como en el prototipo
const benefits: { lines: [string, string]; icon: IconName; color: ColorToken }[] = [
  { lines: ['6 niveles', '24 temas'], icon: 'layers-outline', color: 'accent' },
  { lines: ['Ejercicio en', 'cada tema'], icon: 'check-circle-outline', color: 'accent' },
  { lines: ['Ranking de', 'la carrera'], icon: 'podium', color: 'accent' },
];

/** Fila de beneficios al pie del registro y del acceso. */
export function AuthBenefits() {
  return (
    <Card padding="md">
      <Row>
        {benefits.map((b, i) => (
          <Fragment key={b.icon}>
            {i > 0 && <Divider orientation="vertical" />}
            <Column grow align="center" gap="xs" accessible accessibilityLabel={b.lines.join(' ')}>
              <Icon name={b.icon} color={b.color} size="lg" />
              <AppText variant="caption" weight="semibold" align="center">
                {`${b.lines[0]}\n${b.lines[1]}`}
              </AppText>
            </Column>
          </Fragment>
        ))}
      </Row>
    </Card>
  );
}
