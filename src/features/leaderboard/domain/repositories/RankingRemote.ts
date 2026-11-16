import type { Result } from '@/core/result/Result';

import type { Ranking } from '../entities/Ranking';

export interface RankingRemote {
  /** get_ranking para el usuario de la sesión: los primeros `limit` y su posición. */
  fetch(limit: number): Promise<Result<Ranking, 'NETWORK' | 'INVALID_TOKEN'>>;
}

/** Último ranking recibido, para mostrarlo sin red. */
export interface RankingCache {
  get(): Promise<{ ranking: Ranking; fetchedAt: string } | null>;
  save(ranking: Ranking, fetchedAt: string): Promise<void>;
}
