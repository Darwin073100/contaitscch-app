import type { Tx } from '@/core/transaction/UnitOfWork';

import type { SyncState } from '../entities/Sync';

export interface SyncStateRepository {
  /** Estado del usuario de la sesión; sin fila = nunca ha sincronizado. */
  get(): Promise<SyncState>;
  save(state: SyncState, tx?: Tx): Promise<void>;
}
