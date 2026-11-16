import type { Clock } from '@/core/clock/Clock';
import type { Connectivity } from '@/core/connectivity/Connectivity';
import { err, ok, type Result } from '@/core/result/Result';

import type { Ranking } from '../entities/Ranking';
import type { RankingCache, RankingRemote } from '../repositories/RankingRemote';
import { SyncAndFetchRankingUseCase } from './SyncAndFetchRankingUseCase';

const NOW = '2026-11-15T12:00:00.000Z';
const BEFORE = '2026-11-14T09:00:00.000Z';
const clock: Clock = { nowIso: () => NOW, todayLocal: () => '2026-11-15' };

const ranking = (total: number): Ranking => ({ total, entries: [], me: null });

class FakeRemote implements RankingRemote {
  result: Result<Ranking, 'NETWORK' | 'INVALID_TOKEN'> = ok(ranking(5));
  async fetch() {
    return this.result;
  }
}

class MemoryCache implements RankingCache {
  value: { ranking: Ranking; fetchedAt: string } | null = null;
  async get() {
    return this.value;
  }
  async save(r: Ranking, fetchedAt: string) {
    this.value = { ranking: r, fetchedAt };
  }
}

function setup({ online = true, synced = true } = {}) {
  const calls: string[] = [];
  const sync = {
    execute: async () => {
      calls.push('sync');
      return { ok: synced };
    },
  };
  const remote = new FakeRemote();
  const fetch = remote.fetch.bind(remote);
  remote.fetch = async () => {
    calls.push('fetch');
    return fetch();
  };
  const cache = new MemoryCache();
  const connectivity: Connectivity = { isOnline: async () => online, onReconnect: () => () => {} };
  const useCase = new SyncAndFetchRankingUseCase(sync, remote, cache, connectivity, clock);
  return { calls, remote, cache, useCase };
}

describe('SyncAndFetchRankingUseCase', () => {
  it('sube el avance antes de pedir el ranking y lo guarda', async () => {
    const { calls, cache, useCase } = setup();

    expect(await useCase.execute()).toEqual({
      ok: true,
      value: { ranking: ranking(5), fetchedAt: NOW, live: true, notice: null },
    });
    expect(calls).toEqual(['sync', 'fetch']);
    expect(cache.value).toEqual({ ranking: ranking(5), fetchedAt: NOW });
  });

  it('sin red muestra el último guardado con aviso', async () => {
    const { calls, cache, useCase } = setup({ online: false });
    cache.value = { ranking: ranking(3), fetchedAt: BEFORE };

    expect(await useCase.execute()).toEqual({
      ok: true,
      value: { ranking: ranking(3), fetchedAt: BEFORE, live: false, notice: 'offline' },
    });
    expect(calls).toEqual([]);
  });

  it('si falla la sincronización no pide el ranking (se vería con avance viejo)', async () => {
    const { calls, cache, useCase } = setup({ synced: false });
    cache.value = { ranking: ranking(3), fetchedAt: BEFORE };

    const result = await useCase.execute();

    expect(result.ok && result.value.notice).toBe('sync_failed');
    expect(calls).toEqual(['sync']);
  });

  it('si falla la consulta usa el guardado; sin nada guardado devuelve el error', async () => {
    const { remote, cache, useCase } = setup();
    remote.result = err('NETWORK');

    expect(await useCase.execute()).toEqual({ ok: false, error: 'NETWORK' });

    cache.value = { ranking: ranking(3), fetchedAt: BEFORE };
    const result = await useCase.execute();
    expect(result.ok && result.value).toMatchObject({ live: false, notice: 'network' });
  });

  it('sin red y sin nada guardado: OFFLINE', async () => {
    expect(await setup({ online: false }).useCase.execute()).toEqual({
      ok: false,
      error: 'OFFLINE',
    });
  });
});
