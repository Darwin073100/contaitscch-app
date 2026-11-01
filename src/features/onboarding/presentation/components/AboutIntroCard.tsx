import { AppText, Badge, Card, Column, IconBox, Row } from '@/shared/ui';

import type { aboutContent } from '../content/aboutContent';

type AboutIntroCardProps = { intro: (typeof aboutContent)['intro'] };

/** "¿Qué es CONTAITSCCH?": descripción y chips de los temas que se aprenden. */
export function AboutIntroCard({ intro }: AboutIntroCardProps) {
  return (
    <Card padding="lg">
      <Column gap="lg">
        <Row gap="md">
          <IconBox icon="school-outline" tone="infoSoft" />
          <AppText variant="heading" accessibilityRole="header">
            {intro.title}
          </AppText>
        </Row>
        <AppText tone="muted">{intro.text}</AppText>
        <Row wrap gap="sm">
          {intro.topics.map((t) => (
            <Badge key={t.label} label={t.label} icon={t.icon} appearance="solid" size="md" />
          ))}
        </Row>
      </Column>
    </Card>
  );
}
