import type { ButtonProps, ChoiceState, IconName } from '@/shared/ui';

import type { AnswerCheck, Quiz, QuizResult } from '../../domain/entities/Quiz';

// Textos ya armados para el ejercicio de un tema y el examen integrador: la pantalla solo pinta.

const LETTERS = 'ABCD';

export type QuestionVm = {
  headerTitle: string;
  /** "1 de 2". */
  counter: string;
  progress: number;
  eyebrow: string;
  heading: string;
  icon: IconName;
  statement: string;
  options: { id: number; letter: string; label: string; state: ChoiceState }[];
  /** Solo después de "Comprobar". */
  feedback: { correct: boolean; title: string; text: string } | null;
  primaryLabel: string;
  primaryVariant: NonNullable<ButtonProps['variant']>;
  primaryDisabled: boolean;
};

const levelOf = (topicId: number) => Math.floor(topicId / 100);
const orderOf = (topicId: number) => topicId % 100;

export function toQuestionVm(
  quiz: Quiz,
  index: number,
  picked: number | null,
  check: AnswerCheck | null,
): QuestionVm {
  const exam = quiz.kind === 'final';
  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const last = index === total - 1;

  return {
    headerTitle: exam ? 'Examen integrador' : `Ejercicio · Tema ${orderOf(quiz.id)}`,
    counter: `${index + 1} de ${total}`,
    progress: (index + (check ? 1 : 0)) / total,
    eyebrow: exam
      ? `Pregunta ${index + 1} de ${total}`
      : `Nivel ${levelOf(quiz.id)} • Tema ${orderOf(quiz.id)}`,
    heading: exam ? 'Evalúa toda la ruta' : 'Comprueba lo que aprendiste',
    icon: exam ? 'medal' : 'pencil-box-outline',
    statement: question.statement,
    // Al comprobar solo se marca la elegida; las demás se atenúan (nunca se revela la correcta)
    options: question.options.map((o, i) => ({
      id: o.id,
      letter: LETTERS[i] ?? String(i + 1),
      label: o.text,
      state: check
        ? o.id === picked
          ? check.correct
            ? 'correct'
            : 'incorrect'
          : 'faded'
        : o.id === picked
          ? 'selected'
          : 'idle',
    })),
    feedback: check
      ? {
          correct: check.correct,
          title: check.correct ? 'Correcto' : 'Respuesta incorrecta',
          text: check.correct
            ? (check.feedback ?? 'Bien razonado.')
            : exam
              ? 'Continúa con la siguiente pregunta.'
              : 'Al terminar el ejercicio podrás repasar el tema y volver a intentarlo.',
        }
      : null,
    primaryLabel: check ? (last ? 'Ver resultado' : 'Siguiente pregunta') : 'Comprobar',
    primaryVariant: check ? 'navy' : 'primary',
    primaryDisabled: !check && picked === null,
  };
}

/** Adónde lleva cada botón del resultado. */
export type ResultTarget =
  | { kind: 'topic'; topicId: number }
  | { kind: 'retake'; topicId: number }
  | { kind: 'exam' }
  | { kind: 'route'; levelId: number }
  | { kind: 'home' };

export type ResultVm = {
  passed: boolean;
  title: string;
  subtitle: string;
  stats: { label: string; value: string; tone: 'success' | 'danger' | 'default' }[];
  unlock: { overline: string; text: string; icon: IconName } | null;
  actions: {
    label: string;
    variant: NonNullable<ButtonProps['variant']>;
    icon?: IconName;
    target: ResultTarget;
  }[];
};

/** `nextTopicId`: siguiente tema por aprobar del curso (null si ya no hay). */
export function toResultVm(result: QuizResult, nextTopicId: number | null): ResultVm {
  const { score, total, passMark, passedNow, attempt } = result;
  const stats: ResultVm['stats'] = [
    { label: 'Aciertos', value: `${score}/${total}`, tone: passedNow ? 'success' : 'danger' },
    {
      label: 'Para aprobar',
      value: result.kind === 'final' ? String(passMark) : `${passMark}/${total}`,
      tone: 'default',
    },
    { label: 'Intento', value: String(attempt), tone: 'default' },
  ];

  if (result.kind === 'final') {
    return passedNow
      ? {
          passed: true,
          title: 'Examen aprobado',
          subtitle: 'Terminaste la ruta completa de contabilidad. ¡Felicidades!',
          stats,
          unlock: null,
          actions: [{ label: 'Volver al inicio', variant: 'primary', target: { kind: 'home' } }],
        }
      : {
          passed: false,
          title: 'Examen no aprobado',
          subtitle: `Necesitas ${passMark} aciertos de ${total}. Repasa los temas que se te dificultaron y vuelve a presentarlo.`,
          stats,
          unlock: null,
          actions: [
            {
              label: 'Presentar de nuevo',
              variant: 'primary',
              icon: 'replay',
              target: { kind: 'exam' },
            },
            { label: 'Volver al inicio', variant: 'link', target: { kind: 'home' } },
          ],
        };
  }

  const topicId = result.quizId;
  const levelId = levelOf(topicId);
  const backToRoute = {
    label: 'Volver a la ruta',
    variant: 'link' as const,
    target: { kind: 'route' as const, levelId },
  };

  if (!passedNow) {
    return {
      passed: false,
      title: 'Aún no apruebas este tema',
      subtitle:
        `Acertaste ${score} de ${total} y necesitas ${passMark}. ` +
        (result.wasPassed
          ? 'Este tema ya lo tenías aprobado, así que tu avance se conserva.'
          : 'Vuelve a tomar la lección completa y resuelve el ejercicio otra vez para desbloquear el siguiente tema.'),
      stats,
      unlock: null,
      actions: [
        {
          label: 'Volver a tomar la lección',
          variant: 'primary',
          icon: 'replay',
          target: { kind: 'retake', topicId },
        },
        backToRoute,
      ],
    };
  }

  const unlock: ResultVm['unlock'] = result.finalExamJustUnlocked
    ? {
        overline: `Nivel ${levelId} aprobado`,
        text: 'Aprobaste los 6 niveles. Ya puedes presentar el examen integrador.',
        icon: 'medal',
      }
    : result.levelJustCompleted !== null
      ? {
          overline: `Nivel ${result.levelJustCompleted} aprobado`,
          text: `Se desbloqueó el Nivel ${result.levelJustCompleted + 1}.`,
          icon: 'lock-open-variant',
        }
      : null;

  return {
    passed: true,
    title: '¡Tema aprobado!',
    subtitle:
      !result.wasPassed && nextTopicId !== null
        ? 'Se desbloqueó el siguiente tema.'
        : 'Buen trabajo.',
    stats,
    unlock,
    actions: [
      nextTopicId !== null
        ? {
            label: 'Siguiente tema',
            variant: 'primary',
            icon: 'arrow-right',
            target: { kind: 'topic', topicId: nextTopicId },
          }
        : {
            label: 'Presentar examen final',
            variant: 'amber',
            icon: 'medal',
            target: { kind: 'exam' },
          },
      backToRoute,
    ],
  };
}
