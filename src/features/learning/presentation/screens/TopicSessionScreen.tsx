import { AppHeader, AppText, Badge, Button, Callout, Column, Screen } from '@/shared/ui';

import { SubtopicRenderer } from '../components/SubtopicRenderer';
import { TopicStepFooter } from '../components/TopicStepFooter';
import { TopicStepProgress } from '../components/TopicStepProgress';
import { useTopicSessionViewModel } from '../viewmodels/useTopicSessionViewModel';

type TopicSessionScreenProps = {
  topicId: number;
};

/** Desarrollo de un tema: un subtema por paso, con la barra de avance fija arriba. */
export function TopicSessionScreen({ topicId }: TopicSessionScreenProps) {
  const { state, step, completing, next, previous, exit } = useTopicSessionViewModel(topicId);

  return (
    <Screen
      header={
        <Column gap="sm">
          <AppHeader title={step?.headerTitle ?? 'Tema'} onBack={exit} />
          {step && (
            <TopicStepProgress
              stepLabel={step.stepLabel}
              progress={step.progress}
              rewardLabel={step.rewardLabel}
              rewardAccessibilityLabel={step.rewardAccessibilityLabel}
            />
          )}
        </Column>
      }
      footer={
        step && (
          <TopicStepFooter
            canGoBack={step.canGoBack}
            primaryLabel={step.primaryLabel}
            primaryIcon={step.primaryIcon}
            loading={completing}
            onPrevious={previous}
            onNext={next}
          />
        )
      }
      scroll
      safeBottom
      scrollResetKey={step?.stepLabel}
    >
      {state.status === 'loading' && <AppText variant="caption">Cargando tema…</AppText>}
      {state.status === 'error' && (
        <Column gap="lg">
          <Callout tone="danger" icon="alert-outline" text={state.message} />
          <Button
            label="Volver al temario"
            variant="secondary"
            leftIcon="arrow-left"
            onPress={exit}
          />
        </Column>
      )}
      {step && (
        <Column gap="lg">
          <Column gap="md">
            <Badge label={step.badge} tone="info" icon="school-outline" uppercase />
            <AppText variant="title" accessibilityRole="header">
              {step.title}
            </AppText>
          </Column>
          <SubtopicRenderer blocks={step.blocks} />
        </Column>
      )}
    </Screen>
  );
}
