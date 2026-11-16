import type { Tx } from '@/core/transaction/UnitOfWork';

import type { QuizProgress } from '../entities/QuizProgress';

/** Avance del usuario de la sesión en SQLite. */
export interface QuizProgressRepository {
  /** null si nunca ha presentado ese ejercicio. */
  find(quizId: number, tx?: Tx): Promise<QuizProgress | null>;
  /**
   * Guarda el avance. Por omisión la fila queda pendiente de subir; con `synced: true` queda
   * marcada como igual a la nube (lo que llega de la sincronización).
   */
  save(progress: QuizProgress, tx: Tx, options?: { synced?: boolean }): Promise<void>;
  /** Filas que la nube todavía no tiene. */
  findPending(): Promise<QuizProgress[]>;
  countPending(): Promise<number>;
  /** Borra todo el avance local del usuario (reinicio o reemplazo por el de la nube). */
  deleteAll(tx: Tx): Promise<void>;
}
