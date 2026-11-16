import {
  AppHeader,
  AppText,
  Button,
  Callout,
  Card,
  ChoiceCard,
  Column,
  FeedbackBanner,
  IconBox,
  ProgressBar,
  Row,
  Screen,
} from '@/shared/ui';

import { QuizResultView } from '../components/QuizResultView';
import { useQuizViewModel } from '../viewmodels/useQuizViewModel';

type QuizScreenProps = { quizId: number };

/** Ejercicio de un tema o examen integrador (mismo motor) y su resultado. */
export function QuizScreen({ quizId }: QuizScreenProps) {
  const { state, question, pick, check, next, quit, go } = useQuizViewModel(quizId);
  const busy = state.status === 'answering' && state.busy;

  return (
    <Screen
      header={
        state.status !== 'result' ? (
          <AppHeader
            title={question?.headerTitle ?? 'Ejercicio'}
            backIcon="close"
            counter={question?.counter}
            onBack={quit}
          >
            {question && (
              <ProgressBar
                value={question.progress}
                tone="amber"
                size="sm"
                onNavy
                accessibilityLabel={`Avance: ${question.counter}`}
              />
            )}
          </AppHeader>
        ) : undefined
      }
      footer={
        question && (
          <Column gap="md">
            {question.feedback && <FeedbackBanner {...question.feedback} />}
            <Button
              label={question.primaryLabel}
              variant={question.primaryVariant}
              rightIcon={question.feedback ? 'arrow-right' : undefined}
              disabled={question.primaryDisabled}
              loading={busy}
              onPress={question.feedback ? next : check}
            />
          </Column>
        )
      }
      scroll
      safeBottom
      scrollResetKey={question?.counter}
    >
      {state.status === 'loading' && <AppText variant="caption">Cargando…</AppText>}
      {state.status === 'error' && (
        <Column gap="lg">
          <Callout tone="danger" icon="alert-outline" text={state.message} />
          <Button label="Regresar" variant="ghost" leftIcon="arrow-left" onPress={quit} />
        </Column>
      )}
      {question && (
        <Column gap="lg">
          <Row gap="md">
            <IconBox icon={question.icon} tone={quizId === 900 ? 'amber' : 'accent'} size="lg" />
            <Column grow>
              <AppText variant="overline">{question.eyebrow}</AppText>
              <AppText variant="heading" accessibilityRole="header">
                {question.heading}
              </AppText>
            </Column>
          </Row>
          <Card>
            <AppText variant="subtitle" weight="semibold">
              {question.statement}
            </AppText>
          </Card>
          <Column gap="sm" accessibilityRole="radiogroup">
            {question.options.map((o) => (
              <ChoiceCard
                key={o.id}
                marker={o.letter}
                label={o.label}
                state={o.state}
                disabled={Boolean(question.feedback) || busy}
                onPress={() => pick(o.id)}
              />
            ))}
          </Column>
        </Column>
      )}
      {state.status === 'result' && <QuizResultView result={state.result} onAction={go} />}
    </Screen>
  );
}
