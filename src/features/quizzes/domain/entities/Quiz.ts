// Ejercicio de un tema o examen integrador. Solo preguntas de opción múltiple.

/** Id del examen integrador (el de cada ejercicio de tema es el id del tema). */
export const FINAL_EXAM_ID = 900;

export type QuizKind = 'topic' | 'final';

/** En orden A–D. */
export type QuizOption = { id: number; text: string };

export type QuizQuestion = { id: number; statement: string; options: QuizOption[] };

/** Lo que ve la presentación: nunca incluye cuál es la opción correcta. */
export type Quiz = {
  id: number;
  kind: QuizKind;
  /** Tema del ejercicio; null en el examen integrador. */
  topicId: number | null;
  /** Aciertos mínimos para aprobar. */
  passMark: number;
  questions: QuizQuestion[];
};

/** Respuesta correcta y retroalimentación de una pregunta: solo la usa el dominio para calificar. */
export type AnswerKey = { correctOptionId: number; feedback: string | null };

export type GradableQuiz = Quiz & {
  /** Por id de pregunta. */
  answerKey: Record<number, AnswerKey>;
};

/** Resultado de comprobar una respuesta: si fue correcta y, solo en ese caso, la retroalimentación. */
export type AnswerCheck = { correct: boolean; feedback: string | null };

export type QuizResult = {
  quizId: number;
  kind: QuizKind;
  score: number;
  total: number;
  passMark: number;
  /** Aprobó en este intento. */
  passedNow: boolean;
  /** Ya estaba aprobado antes de este intento (su avance se conserva aunque ahora repruebe). */
  wasPassed: boolean;
  /** Número de este intento. */
  attempt: number;
  bestScore: number;
  /** Nivel que se completó con este intento; null si ninguno. */
  levelJustCompleted: number | null;
  /** Con este intento quedaron aprobados todos los temas. */
  finalExamJustUnlocked: boolean;
};

export type FinalExamStatus = {
  status: 'locked' | 'available' | 'pending' | 'passed';
  attempts: number;
  /** null si nunca lo ha presentado. */
  bestScore: number | null;
  total: number;
  passMark: number;
};
