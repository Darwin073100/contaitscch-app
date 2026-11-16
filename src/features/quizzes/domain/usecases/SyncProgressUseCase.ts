import type { Clock } from '@/core/clock/Clock';
import type { DomainEventBus } from '@/core/events/DomainEventBus';
import type { Connectivity } from '@/core/connectivity/Connectivity';
import { err, ok, type Result } from '@/core/result/Result';
import type { UnitOfWork } from '@/core/transaction/UnitOfWork';

import type { SyncError, SyncErrorCode, SyncOutcome } from '../entities/Sync';
import { reconcile } from '../policies/ProgressRules';
import type { ProgressRemote, RemoteSyncError } from '../repositories/ProgressRemote';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { SyncStateRepository } from '../repositories/SyncStateRepository';

const errorCodes: Record<RemoteSyncError, SyncErrorCode> = {
  NETWORK: 'network',
  INVALID_TOKEN: 'invalid_token',
  INVALID_INPUT: 'invalid_input',
};

/** Lo único que necesita de la sesión: cerrarla si el servidor ya no reconoce el api_token. */
type SessionCloser = { clear(): Promise<void> };

/**
 * Sincroniza el avance (Facade): sube lo pendiente, fusiona con lo que tiene la nube y deja el
 * teléfono igual que la nube. Si la generación no coincide (teléfono nuevo o avance de antes de
 * un reinicio), reemplaza el avance local por el de la nube. Nunca lanza: devuelve Result.
 * Dos llamadas al mismo tiempo comparten la misma sincronización (no se sube dos veces).
 */
export class SyncProgressUseCase {
  private running: Promise<Result<SyncOutcome, SyncError>> | null = null;

  constructor(
    private readonly progress: QuizProgressRepository,
    private readonly state: SyncStateRepository,
    private readonly remote: ProgressRemote,
    private readonly uow: UnitOfWork,
    private readonly connectivity: Connectivity,
    private readonly clock: Clock,
    private readonly events: DomainEventBus,
    private readonly session: SessionCloser,
  ) {}

  execute(): Promise<Result<SyncOutcome, SyncError>> {
    this.running ??= this.sync().finally(() => {
      this.running = null;
      this.events.publish({ type: 'SyncStateChanged' });
    });
    return this.running;
  }

  private async sync(): Promise<Result<SyncOutcome, SyncError>> {
    const current = await this.state.get();
    if (!(await this.connectivity.isOnline())) {
      await this.state.save({ ...current, lastError: 'offline' });
      return err('OFFLINE');
    }

    const pending = await this.progress.findPending();
    const response = await this.remote.sync(current.generation, pending);
    if (!response.ok) {
      await this.state.save({ ...current, lastError: errorCodes[response.error] });
      if (response.error === 'INVALID_TOKEN') await this.session.clear();
      return err(response.error);
    }

    const remote = response.value;
    await this.uow.run(async (tx) => {
      if (remote.status === 'replace') {
        await this.progress.deleteAll(tx);
        for (const row of remote.progress) await this.progress.save(row, tx, { synced: true });
      } else {
        // Se vuelve a leer dentro de la transacción: si cambió durante la subida, queda pendiente
        for (const row of remote.progress) {
          const { progress, synced } = reconcile(await this.progress.find(row.quizId, tx), row);
          await this.progress.save(progress, tx, { synced });
        }
      }
      await this.state.save(
        {
          generation: remote.generation,
          lastSyncedAt: remote.status === 'ok' ? remote.syncedAt : this.clock.nowIso(),
          lastError: null,
        },
        tx,
      );
    });

    this.events.publish({ type: 'ProgressSynced' });
    return ok({ kind: remote.status === 'ok' ? 'merged' : 'replaced', pushed: pending.length });
  }
}
