import { createSeededTestDatabase } from '@/core/database/testing/createSeededTestDatabase';

import { FINAL_EXAM_ID } from '../../domain/entities/Quiz';
import { SqliteQuizRepository } from './SqliteQuizRepository';

describe('SqliteQuizRepository', () => {
  it('arma el ejercicio del tema con preguntas, opciones A–D y su clave', async () => {
    const repo = new SqliteQuizRepository(await createSeededTestDatabase());

    const quiz = await repo.findQuiz(101);

    expect(quiz).toMatchObject({ id: 101, kind: 'topic', topicId: 101, passMark: 2 });
    expect(quiz?.questions.map((q) => q.id)).toEqual([10101, 10102]);
    expect(quiz?.questions[0].options.map((o) => o.id)).toEqual([101011, 101012, 101013, 101014]);
    expect(quiz?.questions[0].statement).toBe(
      '¿Qué hace la contabilidad con las operaciones de un negocio?',
    );
    expect(quiz?.answerKey[10101]).toEqual({
      correctOptionId: 101012,
      feedback: expect.stringContaining('registrar, clasificar, resumir e interpretar'),
    });
  });

  it('el examen integrador: 10 preguntas, 8 para aprobar y sin retroalimentación', async () => {
    const repo = new SqliteQuizRepository(await createSeededTestDatabase());

    const exam = await repo.findQuiz(FINAL_EXAM_ID);

    expect(exam).toMatchObject({ kind: 'final', topicId: null, passMark: 8 });
    expect(exam?.questions).toHaveLength(10);
    expect(Object.keys(exam?.answerKey ?? {})).toHaveLength(10);
    expect(Object.values(exam?.answerKey ?? {}).every((k) => k.feedback === null)).toBe(true);
  });

  it('devuelve null si no existe', async () => {
    const repo = new SqliteQuizRepository(await createSeededTestDatabase());

    expect(await repo.findQuiz(999)).toBeNull();
  });
});
