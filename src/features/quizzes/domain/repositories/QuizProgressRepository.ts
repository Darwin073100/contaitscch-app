import type { Tx } from '@/core/transaction/UnitOfWork';

import type { QuizProgress } from '../entities/QuizProgress';

export interface QuizProgressRepository {
  /** Avance del usuario de la sesión en un ejercicio; null si nunca lo ha presentado. */
  find(quizId: number, tx?: Tx): Promise<QuizProgress | null>;
  /** Guarda el avance; la fila queda pendiente de sincronizar porque cambia su updatedAt. */
  save(progress: QuizProgress, tx: Tx): Promise<void>;
}
