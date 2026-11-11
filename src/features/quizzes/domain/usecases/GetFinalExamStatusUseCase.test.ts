import { FINAL_EXAM_ID } from '../entities/Quiz';
import type { QuizProgress } from '../entities/QuizProgress';
import {
  courseFrom,
  gradableQuiz,
  InMemoryQuizProgressRepository,
  InMemoryQuizReader,
} from '../testing/fakes';
import { GetFinalExamStatusUseCase } from './GetFinalExamStatusUseCase';

const row = (quizId: number, overrides: Partial<QuizProgress> = {}): QuizProgress => ({
  quizId,
  passed: true,
  bestScore: 2,
  attempts: 1,
  passedAt: 'x',
  updatedAt: 'x',
  ...overrides,
});

function run(rows: QuizProgress[]) {
  const progress = new InMemoryQuizProgressRepository();
  rows.forEach((r) => progress.rows.set(r.quizId, r));
  return new GetFinalExamStatusUseCase(
    new InMemoryQuizReader([gradableQuiz(FINAL_EXAM_ID, { questions: 10, passMark: 8 })]),
    progress,
    courseFrom(progress, [101, 102]),
  ).execute();
}

describe('GetFinalExamStatusUseCase', () => {
  it('bloqueado mientras falten temas por aprobar', async () => {
    expect(await run([row(101)])).toEqual({
      ok: true,
      value: { status: 'locked', attempts: 0, bestScore: null, total: 10, passMark: 8 },
    });
  });

  it('disponible con todos los temas aprobados', async () => {
    const result = await run([row(101), row(102)]);

    expect(result.ok && result.value.status).toBe('available');
  });

  it('por aprobar tras un intento reprobado, con su mejor resultado', async () => {
    const result = await run([
      row(101),
      row(102),
      row(FINAL_EXAM_ID, { passed: false, bestScore: 6, attempts: 2, passedAt: null }),
    ]);

    expect(result.ok && result.value).toMatchObject({
      status: 'pending',
      attempts: 2,
      bestScore: 6,
    });
  });

  it('aprobado', async () => {
    const result = await run([row(101), row(102), row(FINAL_EXAM_ID, { bestScore: 9 })]);

    expect(result.ok && result.value).toMatchObject({ status: 'passed', bestScore: 9 });
  });
});
