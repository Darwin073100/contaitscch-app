import type { Clock } from '@/core/clock/Clock';
import { InMemoryDomainEventBus, type DomainEvent } from '@/core/events/DomainEventBus';

import { FINAL_EXAM_ID } from '../entities/Quiz';
import {
  answersFor,
  courseFrom,
  gradableQuiz,
  immediateUnitOfWork,
  InMemoryQuizProgressRepository,
  InMemoryQuizReader,
} from '../testing/fakes';
import { SubmitQuizUseCase } from './SubmitQuizUseCase';

const NOW = '2026-11-10T18:00:00.000Z';
const clock: Clock = { nowIso: () => NOW, todayLocal: () => '2026-11-10' };

const quizzes = [
  gradableQuiz(101),
  gradableQuiz(102),
  gradableQuiz(201),
  gradableQuiz(FINAL_EXAM_ID, { questions: 10, passMark: 8 }),
];

function setup() {
  const progress = new InMemoryQuizProgressRepository();
  const events: DomainEvent[] = [];
  const bus = new InMemoryDomainEventBus();
  bus.subscribe((e) => events.push(e));
  const useCase = new SubmitQuizUseCase(
    new InMemoryQuizReader(quizzes),
    progress,
    immediateUnitOfWork,
    courseFrom(progress, [101, 102, 201]),
    clock,
    bus,
  );
  const submit = (quizId: number, correct: number) => {
    const quiz = quizzes.find((q) => q.id === quizId)!;
    return useCase.execute({ quizId, answers: answersFor(quiz, correct) });
  };
  return { progress, events, submit, useCase };
}

describe('SubmitQuizUseCase', () => {
  it('aprobar (2/2) guarda el avance pendiente de sincronizar y avisa', async () => {
    const { progress, events, submit } = setup();

    const result = await submit(101, 2);

    expect(result).toEqual({
      ok: true,
      value: {
        quizId: 101,
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
      },
    });
    expect(progress.rows.get(101)).toEqual({
      quizId: 101,
      passed: true,
      bestScore: 2,
      attempts: 1,
      passedAt: NOW,
      updatedAt: NOW,
    });
    expect(events).toEqual([{ type: 'ProgressChanged', quizId: 101 }]);
  });

  it('1 de 2 no aprueba; el siguiente tema sigue bloqueado', async () => {
    const { submit } = setup();

    const result = await submit(101, 1);

    expect(result.ok && result.value).toMatchObject({ passedNow: false, attempt: 1 });
    expect(await submit(102, 2)).toEqual({ ok: false, error: 'QUIZ_LOCKED' });
  });

  it('reprobar un tema ya aprobado conserva el avance', async () => {
    const { progress, submit } = setup();
    await submit(101, 2);

    const result = await submit(101, 0);

    expect(result.ok && result.value).toMatchObject({
      passedNow: false,
      wasPassed: true,
      attempt: 2,
    });
    expect(progress.rows.get(101)?.passed).toBe(true);
  });

  it('aprobar el último tema de un nivel avisa que se completó', async () => {
    const { events, submit } = setup();
    await submit(101, 2);

    const result = await submit(102, 2);

    expect(result.ok && result.value.levelJustCompleted).toBe(1);
    expect(events).toContainEqual({ type: 'LevelCompleted', levelId: 1 });
  });

  it('aprobar el último tema del curso abre el examen; aprobar el examen avisa una sola vez', async () => {
    const { events, submit } = setup();
    await submit(101, 2);
    await submit(102, 2);

    const last = await submit(201, 2);
    expect(last.ok && last.value.finalExamJustUnlocked).toBe(true);

    const failed = await submit(FINAL_EXAM_ID, 7);
    expect(failed.ok && failed.value).toMatchObject({ kind: 'final', passedNow: false, total: 10 });

    await submit(FINAL_EXAM_ID, 8);
    await submit(FINAL_EXAM_ID, 10);
    expect(events.filter((e) => e.type === 'FinalExamPassed')).toHaveLength(1);
  });

  it('INCOMPLETE_ANSWERS si falta responder alguna pregunta', async () => {
    const { useCase } = setup();

    expect(await useCase.execute({ quizId: 101, answers: { 10101: 101012 } })).toEqual({
      ok: false,
      error: 'INCOMPLETE_ANSWERS',
    });
  });

  it('QUIZ_NOT_FOUND si no existe', async () => {
    const { useCase } = setup();

    expect(await useCase.execute({ quizId: 999, answers: {} })).toEqual({
      ok: false,
      error: 'QUIZ_NOT_FOUND',
    });
  });
});
