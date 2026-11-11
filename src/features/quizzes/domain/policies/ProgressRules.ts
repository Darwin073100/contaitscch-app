import type { QuizProgress } from '../entities/QuizProgress';

/** Aprobar = aciertos >= aciertos mínimos. */
export function isPassing(score: number, passMark: number): boolean {
  return score >= passMark;
}

/**
 * Avance tras terminar un intento: +1 intento, el mejor puntaje, y aprobar nunca se deshace
 * (passedAt queda en la primera vez que aprobó).
 */
export function applyResult(
  current: QuizProgress | null,
  result: { quizId: number; score: number; passMark: number; at: string },
): QuizProgress {
  const passedNow = isPassing(result.score, result.passMark);
  return {
    quizId: result.quizId,
    passed: (current?.passed ?? false) || passedNow,
    bestScore: Math.max(current?.bestScore ?? 0, result.score),
    attempts: (current?.attempts ?? 0) + 1,
    passedAt: current?.passedAt ?? (passedNow ? result.at : null),
    updatedAt: result.at,
  };
}

/** La fecha más antigua de dos ISO-8601 (comparables como texto), ignorando null. */
function earliest(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a < b ? a : b;
}

/**
 * Fusión del avance de dos teléfonos (misma regla que sync_progress en Postgres). Conmutativa e
 * idempotente: el orden y las repeticiones no cambian el resultado y nunca se pierde un aprobado.
 * `attempts` es el mayor visto en un teléfono, no la suma.
 */
export function mergeProgress(a: QuizProgress, b: QuizProgress): QuizProgress {
  return {
    quizId: a.quizId,
    passed: a.passed || b.passed,
    bestScore: Math.max(a.bestScore, b.bestScore),
    attempts: Math.max(a.attempts, b.attempts),
    passedAt: earliest(a.passedAt, b.passedAt),
    updatedAt: a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt,
  };
}
