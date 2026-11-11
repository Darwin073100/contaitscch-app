/** Avance del usuario en un ejercicio o en el examen final (lo que se sincroniza con la nube). */
export type QuizProgress = {
  quizId: number;
  passed: boolean;
  bestScore: number;
  attempts: number;
  /** Primera vez que aprobó (ISO-8601); null si no ha aprobado. */
  passedAt: string | null;
  /** Último cambio (ISO-8601, Clock.nowIso()). */
  updatedAt: string;
};
