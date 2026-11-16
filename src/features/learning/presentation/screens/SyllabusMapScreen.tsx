import type { ReactNode } from 'react';

import { AppText, Callout, ChipTabs, Screen, type IconName } from '@/shared/ui';

import type { LevelState } from '../../domain/entities/CourseProgress';
import { ContinueTopicBar } from '../components/ContinueTopicBar';
import { ModuleHeaderCard } from '../components/ModuleHeaderCard';
import { TopicPath } from '../components/TopicPath';
import { useSyllabusMapViewModel } from '../viewmodels/useSyllabusMapViewModel';

const tabIcon: Record<LevelState, IconName | undefined> = {
  done: 'check-circle',
  current: undefined,
  locked: 'lock',
};

type SyllabusMapScreenProps = {
  /** Nivel a mostrar; sin él, el nivel actual del alumno. */
  levelId?: number;
  /** Barra superior (la arma la ruta con la sesión del usuario). */
  header: ReactNode;
};

/** Pestaña Aprender: chips de nivel, tarjeta del nivel y su ruta de temas. */
export function SyllabusMapScreen({ levelId, header }: SyllabusMapScreenProps) {
  const { state, openTopic, openExam, openLevel } = useSyllabusMapViewModel(levelId);
  const map = state.status === 'ready' ? state.map : null;
  const action = map?.continueAction ?? null;

  return (
    <Screen
      header={header}
      scroll
      footer={
        action && (
          <ContinueTopicBar
            caption={action.caption}
            title={action.title}
            actionLabel={action.actionLabel}
            retry={action.retry}
            onPress={() =>
              action.target.kind === 'topic' ? openTopic(action.target.topicId) : openExam()
            }
          />
        )
      }
    >
      {state.status === 'loading' && <AppText variant="caption">Cargando ruta…</AppText>}
      {state.status === 'error' && <Callout tone="danger" text={state.message} />}
      {map && (
        <>
          <ChipTabs
            tabs={map.levelTabs.map((t) => ({
              id: t.id,
              label: t.label,
              selected: t.selected,
              icon: tabIcon[t.state],
              iconColor: t.state === 'done' ? 'accent' : 'faint',
              accessibilityLabel: t.accessibilityLabel,
            }))}
            onSelect={openLevel}
          />
          <ModuleHeaderCard {...map.header} />
          <TopicPath
            nodes={map.nodes}
            goal={map.goal}
            onOpenTopic={openTopic}
            onOpenGoal={() =>
              map.goal.target.kind === 'exam' ? openExam() : openLevel(map.goal.target.levelId)
            }
          />
        </>
      )}
    </Screen>
  );
}
