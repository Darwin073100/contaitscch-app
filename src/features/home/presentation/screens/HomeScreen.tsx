import type { ReactNode } from 'react';

import { LevelCard } from '@/features/levels';
import {
  AppText,
  Callout,
  Column,
  IconBox,
  IconButton,
  ListItem,
  Screen,
  SectionHeader,
} from '@/shared/ui';

import { CareerProgressCard } from '../components/CareerProgressCard';
import { FinalExamCard } from '../components/FinalExamCard';
import { GreetingHeader } from '../components/GreetingHeader';
import { NextTopicCard } from '../components/NextTopicCard';
import { StatsCard } from '../components/StatsCard';
import { TipCard } from '../components/TipCard';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

type HomeScreenProps = {
  /** Barra superior (la arma la ruta con la sesión del usuario). */
  header: ReactNode;
};

/** Pestaña Niveles: saludo, avance, siguiente tema, niveles, examen final, tip y "Conoce". */
export function HomeScreen({ header }: HomeScreenProps) {
  const { state, openTopic, openLevel, openExam, openAbout, nextTip } = useHomeViewModel();
  const home = state.status === 'ready' ? state.home : null;

  return (
    <Screen header={header} scroll>
      {state.status === 'loading' && <AppText variant="caption">Cargando…</AppText>}
      {state.status === 'error' && <Callout tone="danger" text={state.message} />}
      {home && (
        <>
          <GreetingHeader {...home.greeting} />
          <StatsCard stats={home.stats} />
          {home.next && (
            <NextTopicCard
              {...home.next}
              onPress={() => home.next && openTopic(home.next.topicId)}
            />
          )}
          <CareerProgressCard {...home.course} />

          <Column gap="lg">
            <SectionHeader title="Niveles" actionLabel={home.levelsLabel} />
            {home.levels.map((level) => (
              <LevelCard key={level.id} level={level} onPress={() => openLevel(level.id)} />
            ))}
          </Column>

          <FinalExamCard {...home.exam} onPress={openExam} />
          <TipCard {...home.tip} onNext={nextTip} />

          <ListItem
            variant="boxed"
            title="Conoce CONTAITSCCH"
            subtitle="Qué es, cómo funciona y quién la desarrolla"
            subtitleLines={2}
            leading={<IconBox icon="book-open-variant" tone="navy" />}
            trailing={
              <IconButton
                icon="chevron-right"
                size="md"
                accessibilityLabel="Abrir Conoce CONTAITSCCH"
                onPress={openAbout}
              />
            }
            onPress={openAbout}
            accessibilityLabel="Conoce CONTAITSCCH"
          />
        </>
      )}
    </Screen>
  );
}
