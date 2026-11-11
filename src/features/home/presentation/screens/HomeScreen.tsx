import { LevelCard } from '@/features/levels';
import {
  AppHeader,
  AppText,
  Badge,
  Callout,
  Column,
  IconBox,
  IconButton,
  ListItem,
  Screen,
  SectionHeader,
} from '@/shared/ui';

import { CareerProgressCard } from '../components/CareerProgressCard';
import { GreetingHeader } from '../components/GreetingHeader';
import { StatsCard } from '../components/StatsCard';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

/** Pestaña Niveles: menú de inicio con estadísticas, progreso de la carrera y niveles. */
export function HomeScreen() {
  const { state, openLevel, openProfile, openAbout } = useHomeViewModel();
  return (
    <Screen header={<AppHeader onProfilePress={openProfile} />} scroll>
      {state.status === 'loading' && <AppText variant="caption">Cargando…</AppText>}
      {state.status === 'error' && <Callout tone="danger" text={state.message} />}
      {state.status === 'ready' && (
        <>
          <GreetingHeader {...state.home.greeting} />
          <StatsCard {...state.home.stats} />
          <CareerProgressCard {...state.home.career} />

          <Column gap="lg">
            <SectionHeader title="Niveles Formativos" actionLabel={state.home.levelsCountLabel} />
            {state.home.levels.map((level) => (
              <LevelCard key={level.id} level={level} onPress={() => openLevel(level.id)} />
            ))}
          </Column>

          <Column gap="lg">
            <SectionHeader
              title="Conoce CONTAITSCCH"
              actionLabel="Acerca de"
              onActionPress={openAbout}
            />
            <ListItem
              variant="boxed"
              title="Introducción a la app"
              subtitle="Conoce el proyecto, objetivos de aprendizaje y colaboradores."
              subtitleLines={2}
              leading={<IconBox icon="book-open-page-variant-outline" tone="accentSoft" />}
              meta={<Badge label="ITSSCH" tone="primary" />}
              trailing={
                <IconButton
                  icon="chevron-right"
                  size="sm"
                  accessibilityLabel="Abrir introducción a la app"
                  onPress={openAbout}
                />
              }
              onPress={openAbout}
              accessibilityLabel="Introducción a la app"
            />
          </Column>
        </>
      )}
    </Screen>
  );
}
