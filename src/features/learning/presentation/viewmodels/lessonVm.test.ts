import type { Lesson } from '../../domain/entities/Lesson';
import { toLessonStepVm } from './lessonVm';

const lesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  level: { id: 2, order: 2 },
  topic: { id: 203, title: 'La naturaleza de las cuentas', order: 3 },
  objective: 'Objetivo',
  body: {
    explanation: ['Párrafo'],
    example: { title: 'Caso', steps: ['Paso'] },
    keyIdea: 'Idea',
    commonError: 'Error',
    activity: 'Actividad',
  },
  quiz: { questionCount: 2, passMark: 2 },
  passed: false,
  retake: false,
  ...overrides,
});

describe('toLessonStepVm', () => {
  it('paso 1: encabezado, contador y cómo se aprueba', () => {
    expect(toLessonStepVm(lesson(), 0)).toMatchObject({
      headerTitle: 'Nivel 2 · Tema 3',
      counter: 'Paso 1 de 4',
      progress: 0.25,
      stepName: 'Objetivo',
      title: 'La naturaleza de las cuentas',
      canGoBack: false,
      isLast: false,
      primaryLabel: 'Continuar',
      retakeNote: null,
      howToPass: expect.stringContaining('ejercicio de 2 preguntas. Necesitas 2 de 2 aciertos'),
    });
  });

  it('el último paso lleva al ejercicio', () => {
    expect(toLessonStepVm(lesson(), 3)).toMatchObject({
      stepName: 'Repaso del tema',
      canGoBack: true,
      isLast: true,
      primaryLabel: 'Ir al ejercicio',
    });
  });

  it('al retomar una lección reprobada avisa solo en el paso 1', () => {
    expect(toLessonStepVm(lesson({ retake: true }), 0).retakeNote).toContain('retomando');
    expect(toLessonStepVm(lesson({ retake: true }), 1).retakeNote).toBeNull();
  });

  it('recorta el paso fuera de rango', () => {
    expect(toLessonStepVm(lesson(), 9).counter).toBe('Paso 4 de 4');
    expect(toLessonStepVm(lesson(), -1).counter).toBe('Paso 1 de 4');
  });
});
