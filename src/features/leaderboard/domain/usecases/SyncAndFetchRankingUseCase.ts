import type { Clock } from '@/core/clock/Clock';
import type { Connectivity } from '@/core/connectivity/Connectivity';
import { err, ok, type Result } from '@/core/result/Result';

import type { RankingView } from '../entities/Ranking';
import type { RankingCache, RankingRemote } from '../repositories/RankingRemote';

export type SyncAndFetchRankingError = 'OFFLINE' | 'NETWORK';

/** Lo único que necesita de SyncProgressUseCase (quizzes): sincronizar el avance antes. */
export type ProgressSyncer = { execute(): Promise<{ ok: boolean }> };

const RANKING_LIMIT = 100;

/**
 * Pestaña Ranking (Facade): primero sube el avance pendiente, así el alumno se ve con su avance
 * real, y después pide el ranking. Sin red o si algo falla, muestra el último guardado con aviso.
 */
export class SyncAndFetchRankingUseCase {
  constructor(
    private readonly sync: ProgressSyncer,
    private readonly remote: RankingRemote,
    private readonly cache: RankingCache,
    private readonly connectivity: Connectivity,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<Result<RankingView, SyncAndFetchRankingError>> {
    if (!(await this.connectivity.isOnline())) return this.fromCache('offline');

    const synced = await this.sync.execute();
    if (!synced.ok) return this.fromCache('sync_failed');

    const fresh = await this.remote.fetch(RANKING_LIMIT);
    if (!fresh.ok) return this.fromCache('network');

    const fetchedAt = this.clock.nowIso();
    await this.cache.save(fresh.value, fetchedAt);
    return ok({ ranking: fresh.value, fetchedAt, live: true, notice: null });
  }

  private async fromCache(
    notice: NonNullable<RankingView['notice']>,
  ): Promise<Result<RankingView, SyncAndFetchRankingError>> {
    const cached = await this.cache.get();
    if (cached) return ok({ ...cached, live: false, notice });
    return err(notice === 'offline' ? 'OFFLINE' : 'NETWORK');
  }
}
