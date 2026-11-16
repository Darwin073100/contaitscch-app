import type { Lesson } from '../../domain/entities/Lesson';

/** Los 4 pasos fijos de cada tema, en orden. */
export const LESSON_STEPS = ['Objetivo', 'Explicación', 'Ejemplo resuelto', 'Repaso del tema'];

export type LessonStepVm = {
  /** 0..3: qué paso pintar. */
  index: number;
  /** "Nivel 1 · Tema 2". */
  headerTitle: string;
  /** "Paso 2 de 4". */
  counter: string;
  progress: number;
  stepName: string;
  title: string;
  canGoBack: boolean;
  isLast: boolean;
  primaryLabel: string;
  /** Aviso al retomar una lección reprobada (solo en el paso 1). */
  retakeNote: string | null;
  /** "Cómo se aprueba este tema" (paso 1). */
  howToPass: string;
};

/** `step` se recorta al rango válido. */
export function toLessonStepVm(lesson: Lesson, step: number): LessonStepVm {
  const total = LESSON_STEPS.length;
  const index = Math.min(Math.max(step, 0), total - 1);
  const isLast = index === total - 1;
  const { questionCount, passMark } = lesson.quiz;

  return {
    index,
    headerTitle: `Nivel ${lesson.level.order} · Tema ${lesson.topic.order}`,
    counter: `Paso ${index + 1} de ${total}`,
    progress: (index + 1) / total,
    stepName: LESSON_STEPS[index],
    title: lesson.topic.title,
    canGoBack: index > 0,
    isLast,
    primaryLabel: isLast ? 'Ir al ejercicio' : 'Continuar',
    retakeNote:
      index === 0 && lesson.retake
        ? 'Estás retomando esta lección. Repásala con calma antes de volver a resolver el ejercicio.'
        : null,
    howToPass:
      `Lee la explicación, revisa el ejemplo y el repaso, y resuelve el ejercicio de ` +
      `${questionCount} ${questionCount === 1 ? 'pregunta' : 'preguntas'}. Necesitas ` +
      `${passMark} de ${questionCount} aciertos para desbloquear el siguiente tema.`,
  };
}
