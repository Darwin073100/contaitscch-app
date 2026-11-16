import {
  AppHeader,
  AppText,
  Badge,
  Button,
  Callout,
  Column,
  ProgressBar,
  Screen,
} from '@/shared/ui';

import { ExampleStep } from '../components/ExampleStep';
import { ExplanationStep } from '../components/ExplanationStep';
import { LessonFooter } from '../components/LessonFooter';
import { ObjectiveStep } from '../components/ObjectiveStep';
import { ReviewStep } from '../components/ReviewStep';
import { useLessonViewModel } from '../viewmodels/useLessonViewModel';

type LessonScreenProps = { topicId: number };

/** Tema en 4 pasos (objetivo + infografía → explicación → ejemplo → repaso) y luego su ejercicio. */
export function LessonScreen({ topicId }: LessonScreenProps) {
  const { state, step, next, previous, exit } = useLessonViewModel(topicId);
  const lesson = state.status === 'ready' ? state.lesson : null;

  return (
    <Screen
      header={
        <AppHeader title={step?.headerTitle ?? 'Tema'} counter={step?.counter} onBack={exit}>
          {step && (
            <ProgressBar
              value={step.progress}
              tone="amber"
              size="sm"
              onNavy
              accessibilityLabel={`Avance del tema: ${step.counter}`}
            />
          )}
        </AppHeader>
      }
      footer={
        step && (
          <LessonFooter
            canGoBack={step.canGoBack}
            primaryLabel={step.primaryLabel}
            onPrevious={previous}
            onNext={next}
          />
        )
      }
      scroll
      safeBottom
      scrollResetKey={step?.index}
    >
      {state.status === 'loading' && <AppText variant="caption">Cargando tema…</AppText>}
      {state.status === 'error' && (
        <Column gap="lg">
          <Callout tone="danger" icon="alert-outline" text={state.message} />
          <Button label="Volver a la ruta" variant="ghost" leftIcon="arrow-left" onPress={exit} />
        </Column>
      )}
      {lesson && step && (
        <Column gap="lg">
          <Column gap="md">
            <Badge label={step.stepName} icon="school" uppercase />
            <AppText variant="display" accessibilityRole="header">
              {step.title}
            </AppText>
          </Column>
          {step.index === 0 && (
            <ObjectiveStep
              topicId={lesson.topic.id}
              title={lesson.topic.title}
              objective={lesson.objective}
              retakeNote={step.retakeNote}
              howToPass={step.howToPass}
            />
          )}
          {step.index === 1 && <ExplanationStep paragraphs={lesson.body.explanation} />}
          {step.index === 2 && (
            <ExampleStep title={lesson.body.example.title} steps={lesson.body.example.steps} />
          )}
          {step.index === 3 && (
            <ReviewStep
              keyIdea={lesson.body.keyIdea}
              commonError={lesson.body.commonError}
              activity={lesson.body.activity}
            />
          )}
        </Column>
      )}
    </Screen>
  );
}
