import { err, ok, type Result } from '@/core/result/Result';

import type { Quiz } from '../entities/Quiz';
import { canTakeQuiz } from '../policies/QuizAccessPolicy';
import type { CourseProgressSource } from '../repositories/CourseProgressSource';
import type { QuizReader } from '../repositories/QuizReader';

export type StartQuizError = 'QUIZ_NOT_FOUND' | 'QUIZ_LOCKED';

/** Preguntas del ejercicio de un tema o del examen integrador, sin la clave de respuestas. */
export class StartQuizUseCase {
  constructor(
    private readonly quizzes: QuizReader,
    private readonly course: CourseProgressSource,
  ) {}

  async execute({ quizId }: { quizId: number }): Promise<Result<Quiz, StartQuizError>> {
    const quiz = await this.quizzes.findQuiz(quizId);
    if (!quiz) return err('QUIZ_NOT_FOUND');
    if (!canTakeQuiz(quiz, await this.course.execute())) return err('QUIZ_LOCKED');

    const { answerKey: _answerKey, ...visible } = quiz;
    return ok(visible);
  }
}
