import type { Clock } from '@/core/clock/Clock';
import type { DomainEventBus } from '@/core/events/DomainEventBus';
import type { Connectivity } from '@/core/connectivity/Connectivity';
import { err, ok, type Result } from '@/core/result/Result';
import type { UnitOfWork } from '@/core/transaction/UnitOfWork';

import type { ProgressRemote } from '../repositories/ProgressRemote';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { SyncStateRepository } from '../repositories/SyncStateRepository';

export type ResetProgressError = 'OFFLINE' | 'NETWORK' | 'INVALID_TOKEN';

/**
 * "Reiniciar mi avance". Necesita conexión: primero se borra en la nube (sube la generación, así
 * ningún otro teléfono lo resucita) y solo después en el teléfono. La cuenta se conserva.
 */
export class ResetProgressUseCase {
  constructor(
    private readonly progress: QuizProgressRepository,
    private readonly state: SyncStateRepository,
    private readonly remote: ProgressRemote,
    private readonly uow: UnitOfWork,
    private readonly connectivity: Connectivity,
    private readonly clock: Clock,
    private readonly events: DomainEventBus,
  ) {}

  async execute(): Promise<Result<void, ResetProgressError>> {
    if (!(await this.connectivity.isOnline())) return err('OFFLINE');

    const reset = await this.remote.reset();
    if (!reset.ok) return err(reset.error);

    await this.uow.run(async (tx) => {
      await this.progress.deleteAll(tx);
      await this.state.save(
        { generation: reset.value.generation, lastSyncedAt: this.clock.nowIso(), lastError: null },
        tx,
      );
    });
    this.events.publish({ type: 'ProgressSynced' });
    this.events.publish({ type: 'SyncStateChanged' });
    return ok(undefined);
  }
}
