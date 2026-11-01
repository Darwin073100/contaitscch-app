import { AppText, Badge, Card, Column, Logo, Row, StatTile } from '@/shared/ui';

import type { aboutContent } from '../content/aboutContent';

type AboutHeroProps = {
  hero: (typeof aboutContent)['hero'];
  highlights: (typeof aboutContent)['highlights'];
};

/** Logotipo, versión, nombre y los 3 pilares de la gamificación. */
export function AboutHero({ hero, highlights }: AboutHeroProps) {
  return (
    <Card tone="outline" padding="lg">
      <Column align="center" gap="lg">
        <Column align="center" gap="sm">
          <Logo size="lg" />
          <Badge label={hero.version} tone="primary" icon="check-decagram-outline" />
        </Column>
        <Column align="center" gap="xs">
          <AppText variant="display" align="center" accessibilityRole="header">
            {hero.title}
          </AppText>
          <AppText variant="overline" tone="primary" align="center">
            {hero.tagline}
          </AppText>
        </Column>
        <Row gap="sm" align="stretch">
          {highlights.map((h) => (
            <StatTile key={h.label} label={h.label} icon={h.icon} iconColor={h.color} />
          ))}
        </Row>
      </Column>
    </Card>
  );
}
