import { AppHeader, AppText, Callout, Screen } from '@/shared/ui';

import { ContinueTopicBar } from '../components/ContinueTopicBar';
import { ModuleHeaderCard } from '../components/ModuleHeaderCard';
import { TopicPath } from '../components/TopicPath';
import { useSyllabusMapViewModel } from '../viewmodels/useSyllabusMapViewModel';

// Temporal: el nivel actual lo dará la feature levels (nivel más alto desbloqueado).
const CURRENT_LEVEL_ID = 1;

/** Pestaña Aprender: mapa del temario del nivel actual. */
export function SyllabusMapScreen() {
  const { state, openTopic, openExam } = useSyllabusMapViewModel(CURRENT_LEVEL_ID);
  const action = state.status === 'ready' ? state.map.continueAction : null;

  return (
    <Screen
      header={<AppHeader />}
      scroll
      footer={
        action && (
          <ContinueTopicBar
            caption={action.caption}
            title={action.title}
            actionLabel={action.actionLabel}
            onPress={() =>
              action.target.kind === 'topic' ? openTopic(action.target.topicId) : openExam()
            }
          />
        )
      }
    >
      {state.status === 'loading' && <AppText variant="caption">Cargando temario…</AppText>}
      {state.status === 'error' && <Callout tone="danger" text={state.message} />}
      {state.status === 'ready' && (
        <>
          <ModuleHeaderCard {...state.map.header} />
          <TopicPath
            nodes={state.map.nodes}
            exam={state.map.exam}
            onOpenTopic={openTopic}
            onOpenExam={openExam}
          />
        </>
      )}
    </Screen>
  );
}
