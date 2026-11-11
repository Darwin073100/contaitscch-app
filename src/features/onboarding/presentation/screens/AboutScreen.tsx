import {
  AppHeader,
  AppText,
  Button,
  Card,
  Column,
  Icon,
  IconBox,
  ListItem,
  Row,
  Screen,
  SectionHeader,
} from '@/shared/ui';

import { AboutHero } from '../components/AboutHero';
import { AboutIntroCard } from '../components/AboutIntroCard';
import { TeamCard } from '../components/TeamCard';
import { useAboutViewModel } from '../viewmodels/useAboutViewModel';

/** Acerca de: qué es la app, objetivos y equipo. Contenido estático. */
export function AboutScreen() {
  const { content, goBack, startLearning } = useAboutViewModel();

  return (
    <Screen header={<AppHeader title="Acerca de" onBack={goBack} />} scroll safeBottom>
      <AboutHero hero={content.hero} highlights={content.highlights} />
      <AboutIntroCard intro={content.intro} />

      <Column gap="md">
        <SectionHeader title="Objetivos del Proyecto" icon="flag-outline" />
        {content.objectives.map((o) => (
          <ListItem
            key={o.title}
            variant="boxed"
            title={o.title}
            subtitle={o.description}
            leading={<IconBox icon={o.icon} tone={o.tone} />}
          />
        ))}
      </Column>

      <Column gap="md">
        <SectionHeader title="Equipo y Colaboradores" icon="account-group-outline" />
        <TeamCard institution={content.institution} team={content.team} />
      </Column>

      <Card padding="lg">
        <Row gap="md">
          <Icon name="heart-outline" color="primary" />
          <Column grow>
            <AppText variant="caption" tone="default" weight="semibold">
              {content.closing}
            </AppText>
          </Column>
        </Row>
      </Card>

      <Button label={content.cta} rightIcon="rocket-launch-outline" onPress={startLearning} />
    </Screen>
  );
}
