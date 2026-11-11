// API pública de quizzes: lo único que src/app y otras features pueden importar.
// Motor común del ejercicio de cada tema y del examen integrador (solo opción múltiple).
export {
  FINAL_EXAM_ID,
  type AnswerCheck,
  type FinalExamStatus,
  type Quiz,
  type QuizKind,
  type QuizOption,
  type QuizQuestion,
  type QuizResult,
} from './domain/entities/Quiz';
export type { QuizProgress } from './domain/entities/QuizProgress';
export { mergeProgress } from './domain/policies/ProgressRules';
export { CheckAnswerUseCase } from './domain/usecases/CheckAnswerUseCase';
export { GetFinalExamStatusUseCase } from './domain/usecases/GetFinalExamStatusUseCase';
export { StartQuizUseCase } from './domain/usecases/StartQuizUseCase';
export { SubmitQuizUseCase } from './domain/usecases/SubmitQuizUseCase';
