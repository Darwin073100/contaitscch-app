import type { Result } from '@/core/result/Result';

import type { QuizProgress } from '../entities/QuizProgress';

/** Respuesta de sync_progress (supabase/migrations/…_progress_rpc.sql). */
export type RemoteSyncResponse =
  | { status: 'ok'; generation: number; syncedAt: string; progress: QuizProgress[] }
  /** La generación no coincide: el teléfono debe reemplazar su avance por el de la nube. */
  | { status: 'replace'; generation: number; progress: QuizProgress[] };

export type RemoteSyncError = 'NETWORK' | 'INVALID_TOKEN' | 'INVALID_INPUT';

/** El avance del usuario de la sesión en la nube. */
export interface ProgressRemote {
  sync(
    generation: number | null,
    pending: QuizProgress[],
  ): Promise<Result<RemoteSyncResponse, RemoteSyncError>>;
  /** Borra el avance en la nube y devuelve la nueva generación. */
  reset(): Promise<Result<{ generation: number }, 'NETWORK' | 'INVALID_TOKEN'>>;
}
