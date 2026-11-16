import { AppText, Button, Card, Column, IconBox, Row, ScoreTile, Seal } from '@/shared/ui';

import type { ResultTarget, ResultVm } from '../viewmodels/quizVm';

type QuizResultViewProps = {
  result: ResultVm;
  onAction: (target: ResultTarget) => void;
};

/** Resultado del ejercicio o del examen: sello, cifras, desbloqueo y siguientes pasos. */
export function QuizResultView({ result, onAction }: QuizResultViewProps) {
  return (
    <Column gap="xl">
      <Column align="center" gap="md">
        <Seal passed={result.passed} icon={result.passed ? 'check-bold' : 'replay'} />
        <AppText variant="title" align="center" accessibilityRole="header">
          {result.title}
        </AppText>
        <AppText tone="muted" align="center">
          {result.subtitle}
        </AppText>
      </Column>

      <Row gap="sm">
        {result.stats.map((s) => (
          <ScoreTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </Row>

      {result.unlock && (
        <Card>
          <Row gap="md">
            <IconBox icon={result.unlock.icon} tone="solid" size="lg" />
            <Column grow gap="xs">
              <AppText variant="overline" tone="accent">
                {result.unlock.overline}
              </AppText>
              <AppText weight="bold">{result.unlock.text}</AppText>
            </Column>
          </Row>
        </Card>
      )}

      <Column gap="md">
        {result.actions.map((a) => (
          <Button
            key={a.label}
            label={a.label}
            variant={a.variant}
            leftIcon={a.icon === 'replay' ? a.icon : undefined}
            rightIcon={a.icon && a.icon !== 'replay' ? a.icon : undefined}
            onPress={() => onAction(a.target)}
          />
        ))}
      </Column>
    </Column>
  );
}
