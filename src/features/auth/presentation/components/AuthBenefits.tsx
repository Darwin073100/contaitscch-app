import { Fragment } from 'react';

import type { ColorToken } from '@/shared/theme';
import { AppText, Card, Column, Divider, Icon, Row, type IconName } from '@/shared/ui';

const benefits: { label: string; icon: IconName; color: ColorToken }[] = [
  { label: 'Certificado', icon: 'certificate-outline', color: 'primary' },
  { label: 'Ligas y Rangos', icon: 'medal-outline', color: 'silver' },
  { label: '100% Seguro', icon: 'shield-lock-outline', color: 'accent' },
];

/** Fila de beneficios al pie del registro (Certificado · Ligas y Rangos · 100% Seguro). */
export function AuthBenefits() {
  return (
    <Card padding="md">
      <Row>
        {benefits.map((b, i) => (
          <Fragment key={b.label}>
            {i > 0 && <Divider orientation="vertical" />}
            <Column grow align="center" gap="xs" accessible accessibilityLabel={b.label}>
              <Icon name={b.icon} color={b.color} size="lg" />
              <AppText variant="caption" tone="default" weight="semibold" align="center">
                {b.label}
              </AppText>
            </Column>
          </Fragment>
        ))}
      </Row>
    </Card>
  );
}
