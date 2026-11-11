import { err, ok, type Result } from '@/core/result/Result';

import type { AnswerCheck } from '../entities/Quiz';
import type { QuizReader } from '../repositories/QuizReader';

export type CheckAnswerError = 'QUESTION_NOT_FOUND';

/**
 * "Comprobar": dice si la opción elegida es correcta, sin revelar cuál era la correcta.
 * La retroalimentación solo se entrega cuando acierta.
 */
export class CheckAnswerUseCase {
  constructor(private readonly quizzes: QuizReader) {}

  async execute({
    quizId,
    questionId,
    optionId,
  }: {
    quizId: number;
    questionId: number;
    optionId: number;
  }): Promise<Result<AnswerCheck, CheckAnswerError>> {
    const key = (await this.quizzes.findQuiz(quizId))?.answerKey[questionId];
    if (!key) return err('QUESTION_NOT_FOUND');

    const correct = key.correctOptionId === optionId;
    return ok({ correct, feedback: correct ? key.feedback : null });
  }
}
