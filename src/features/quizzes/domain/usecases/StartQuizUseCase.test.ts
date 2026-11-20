import { keepOrder, type Shuffler } from '@/core/random/Shuffler';

import { FINAL_EXAM_ID } from '../entities/Quiz';
import {
  courseFrom,
  gradableQuiz,
  InMemoryQuizProgressRepository,
  InMemoryQuizReader,
} from '../testing/fakes';
import { StartQuizUseCase } from './StartQuizUseCase';

const setup = (passed: number[] = [], shuffler: Shuffler = keepOrder) => {
  const progress = new InMemoryQuizProgressRepository();
  for (const quizId of passed) {
    progress.rows.set(quizId, {
      quizId,
      passed: true,
      bestScore: 2,
      attempts: 1,
      passedAt: 'x',
      updatedAt: 'x',
    });
  }
  const reader = new InMemoryQuizReader([
    gradableQuiz(101),
    gradableQuiz(102),
    gradableQuiz(FINAL_EXAM_ID, { questions: 10, passMark: 8 }),
  ]);
  return new StartQuizUseCase(reader, courseFrom(progress, [101, 102]), shuffler);
};

describe('StartQuizUseCase', () => {
  it('entrega las preguntas sin la clave de respuestas', async () => {
    const result = await setup().execute({ quizId: 101 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.questions).toHaveLength(2);
    expect(result.value.questions[0].options.map((o) => o.id)).toEqual([
      101011, 101012, 101013, 101014,
    ]);
    expect(result.value).not.toHaveProperty('answerKey');
    expect(JSON.stringify(result.value)).not.toContain('correct');
  });

  it('revuelve las opciones de cada pregunta y conserva el orden de las preguntas', async () => {
    const reverse: Shuffler = { shuffle: (items) => [...items].reverse() };

    const result = await setup([], reverse).execute({ quizId: 101 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.questions.map((q) => q.id)).toEqual([10101, 10102]);
    expect(result.value.questions[0].options.map((o) => o.id)).toEqual([
      101014, 101013, 101012, 101011,
    ]);
    expect(JSON.stringify(result.value)).not.toContain('correct');
  });

  it('un tema bloqueado no se puede presentar; uno aprobado sí (repaso)', async () => {
    expect(await setup().execute({ quizId: 102 })).toEqual({ ok: false, error: 'QUIZ_LOCKED' });
    expect((await setup([101]).execute({ quizId: 101 })).ok).toBe(true);
  });

  it('el examen integrador se abre con todos los temas aprobados', async () => {
    expect(await setup([101]).execute({ quizId: FINAL_EXAM_ID })).toEqual({
      ok: false,
      error: 'QUIZ_LOCKED',
    });
    expect((await setup([101, 102]).execute({ quizId: FINAL_EXAM_ID })).ok).toBe(true);
  });

  it('QUIZ_NOT_FOUND si no existe', async () => {
    expect(await setup().execute({ quizId: 999 })).toEqual({ ok: false, error: 'QUIZ_NOT_FOUND' });
  });
});
