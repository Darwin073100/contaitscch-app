import type { Connectivity } from '@/core/connectivity/Connectivity';

import type { SyncStatus } from '../entities/Sync';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { SyncStateRepository } from '../repositories/SyncStateRepository';

/** Estado del indicador de sincronización (topbar y Perfil). */
export class GetSyncStatusUseCase {
  constructor(
    private readonly progress: QuizProgressRepository,
    private readonly state: SyncStateRepository,
    private readonly connectivity: Connectivity,
  ) {}

  async execute(): Promise<SyncStatus> {
    const [pendingCount, state, online] = await Promise.all([
      this.progress.countPending(),
      this.state.get(),
      this.connectivity.isOnline(),
    ]);
    const { lastSyncedAt, lastError } = state;

    let status: SyncStatus['status'];
    if (!online) status = 'offline';
    else if (lastError && lastError !== 'offline') status = 'error';
    else if (pendingCount > 0) status = 'pending';
    else status = lastSyncedAt ? 'synced' : 'never';

    return { status, pendingCount, lastSyncedAt };
  }
}
