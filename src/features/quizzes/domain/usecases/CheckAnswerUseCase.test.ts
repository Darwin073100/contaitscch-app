import { FINAL_EXAM_ID } from '../entities/Quiz';
import { gradableQuiz, InMemoryQuizReader } from '../testing/fakes';
import { CheckAnswerUseCase } from './CheckAnswerUseCase';

const useCase = new CheckAnswerUseCase(
  new InMemoryQuizReader([gradableQuiz(101), gradableQuiz(FINAL_EXAM_ID)]),
);

describe('CheckAnswerUseCase', () => {
  it('acierto: correcto con su retroalimentación', async () => {
    expect(await useCase.execute({ quizId: 101, questionId: 10101, optionId: 101012 })).toEqual({
      ok: true,
      value: { correct: true, feedback: 'Bien: 10101' },
    });
  });

  it('error: incorrecto, sin retroalimentación ni la opción correcta', async () => {
    const result = await useCase.execute({ quizId: 101, questionId: 10101, optionId: 101013 });

    expect(result).toEqual({ ok: true, value: { correct: false, feedback: null } });
  });

  it('en el examen no hay retroalimentación', async () => {
    const result = await useCase.execute({
      quizId: FINAL_EXAM_ID,
      questionId: 90001,
      optionId: 900012,
    });

    expect(result).toEqual({ ok: true, value: { correct: true, feedback: null } });
  });

  it('QUESTION_NOT_FOUND si la pregunta no es de ese ejercicio', async () => {
    expect(await useCase.execute({ quizId: 101, questionId: 90001, optionId: 1 })).toEqual({
      ok: false,
      error: 'QUESTION_NOT_FOUND',
    });
  });
});
