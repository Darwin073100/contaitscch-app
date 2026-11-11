import type { GradableQuiz } from '../entities/Quiz';

export interface QuizReader {
  /** Ejercicio con preguntas y opciones en orden, y su clave de respuestas; null si no existe. */
  findQuiz(quizId: number): Promise<GradableQuiz | null>;
}
