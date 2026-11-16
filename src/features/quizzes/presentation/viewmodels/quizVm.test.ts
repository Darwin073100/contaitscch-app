import type { Quiz, QuizResult } from '../../domain/entities/Quiz';
import { toQuestionVm, toResultVm } from './quizVm';

const quiz = (id: number, questions = 2): Quiz => ({
  id,
  kind: id === 900 ? 'final' : 'topic',
  topicId: id === 900 ? null : id,
  passMark: id === 900 ? 8 : questions,
  questions: Array.from({ length: questions }, (_, i) => ({
    id: id * 100 + i + 1,
    statement: `Pregunta ${i + 1}`,
    options: [1, 2, 3, 4].map((o) => ({ id: (id * 100 + i + 1) * 10 + o, text: `Opción ${o}` })),
  })),
});

const result = (overrides: Partial<QuizResult> = {}): QuizResult => ({
  quizId: 203,
  kind: 'topic',
  score: 2,
  total: 2,
  passMark: 2,
  passedNow: true,
  wasPassed: false,
  attempt: 1,
  bestScore: 2,
  levelJustCompleted: null,
  finalExamJustUnlocked: false,
  ...overrides,
});

describe('toQuestionVm', () => {
  it('antes de comprobar: opciones A–D y "Comprobar" deshabilitado sin elegir', () => {
    const vm = toQuestionVm(quiz(203), 0, null, null);

    expect(vm).toMatchObject({
      headerTitle: 'Ejercicio · Tema 3',
      counter: '1 de 2',
      progress: 0,
      eyebrow: 'Nivel 2 • Tema 3',
      heading: 'Comprueba lo que aprendiste',
      primaryLabel: 'Comprobar',
      primaryDisabled: true,
      feedback: null,
    });
    expect(vm.options.map((o) => `${o.letter}:${o.state}`)).toEqual([
      'A:idle',
      'B:idle',
      'C:idle',
      'D:idle',
    ]);
  });

  it('con una opción elegida se puede comprobar', () => {
    const vm = toQuestionVm(quiz(203), 0, 203012, null);

    expect(vm.options[1].state).toBe('selected');
    expect(vm.primaryDisabled).toBe(false);
  });

  it('respuesta incorrecta: solo se marca la elegida, las demás se atenúan', () => {
    const vm = toQuestionVm(quiz(203), 0, 203013, { correct: false, feedback: null });

    expect(vm.options.map((o) => o.state)).toEqual(['faded', 'faded', 'incorrect', 'faded']);
    expect(vm.feedback).toEqual({
      correct: false,
      title: 'Respuesta incorrecta',
      text: 'Al terminar el ejercicio podrás repasar el tema y volver a intentarlo.',
    });
    expect(vm).toMatchObject({ progress: 0.5, primaryLabel: 'Siguiente pregunta' });
  });

  it('respuesta correcta en la última pregunta: retroalimentación y "Ver resultado"', () => {
    const vm = toQuestionVm(quiz(203), 1, 203022, { correct: true, feedback: 'Así es.' });

    expect(vm.feedback).toMatchObject({ correct: true, title: 'Correcto', text: 'Así es.' });
    expect(vm).toMatchObject({
      primaryLabel: 'Ver resultado',
      primaryVariant: 'navy',
      progress: 1,
    });
  });

  it('examen integrador', () => {
    const vm = toQuestionVm(quiz(900, 10), 6, null, null);

    expect(vm).toMatchObject({
      headerTitle: 'Examen integrador',
      counter: '7 de 10',
      eyebrow: 'Pregunta 7 de 10',
      heading: 'Evalúa toda la ruta',
    });
    expect(
      toQuestionVm(quiz(900, 10), 6, 900071, { correct: false, feedback: null }).feedback?.text,
    ).toBe('Continúa con la siguiente pregunta.');
  });
});

describe('toResultVm', () => {
  it('tema aprobado: siguiente tema y volver a la ruta', () => {
    const vm = toResultVm(result(), 204);

    expect(vm).toMatchObject({
      passed: true,
      title: '¡Tema aprobado!',
      subtitle: 'Se desbloqueó el siguiente tema.',
      unlock: null,
    });
    expect(vm.stats.map((s) => `${s.label}:${s.value}`)).toEqual([
      'Aciertos:2/2',
      'Para aprobar:2/2',
      'Intento:1',
    ]);
    expect(vm.actions.map((a) => a.target)).toEqual([
      { kind: 'topic', topicId: 204 },
      { kind: 'route', levelId: 2 },
    ]);
  });

  it('aprobar el último tema de un nivel avisa el desbloqueo del siguiente', () => {
    expect(toResultVm(result({ levelJustCompleted: 2 }), 301).unlock).toEqual({
      overline: 'Nivel 2 aprobado',
      text: 'Se desbloqueó el Nivel 3.',
      icon: 'lock-open-variant',
    });
  });

  it('aprobar el último tema del curso lleva al examen integrador', () => {
    const vm = toResultVm(
      result({ quizId: 604, levelJustCompleted: 6, finalExamJustUnlocked: true }),
      null,
    );

    expect(vm.unlock?.text).toContain('examen integrador');
    expect(vm.actions[0]).toMatchObject({
      label: 'Presentar examen final',
      target: { kind: 'exam' },
    });
  });

  it('tema reprobado: volver a tomar la lección', () => {
    const vm = toResultVm(result({ score: 1, passedNow: false, attempt: 2 }), 203);

    expect(vm).toMatchObject({ passed: false, title: 'Aún no apruebas este tema' });
    expect(vm.subtitle).toContain('Acertaste 1 de 2 y necesitas 2');
    expect(vm.actions[0].target).toEqual({ kind: 'retake', topicId: 203 });
  });

  it('reprobar un tema ya aprobado aclara que el avance se conserva', () => {
    const vm = toResultVm(result({ score: 0, passedNow: false, wasPassed: true }), 204);

    expect(vm.subtitle).toContain('tu avance se conserva');
  });

  it('examen integrador aprobado y reprobado', () => {
    const exam = { quizId: 900, kind: 'final' as const, total: 10, passMark: 8 };

    expect(toResultVm(result({ ...exam, score: 9 }), null)).toMatchObject({
      title: 'Examen aprobado',
      actions: [{ target: { kind: 'home' } }],
    });
    const failed = toResultVm(result({ ...exam, score: 7, passedNow: false }), null);
    expect(failed.title).toBe('Examen no aprobado');
    expect(failed.stats[1].value).toBe('8');
    expect(failed.actions[0].target).toEqual({ kind: 'exam' });
  });
});
