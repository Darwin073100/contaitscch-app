import { z } from 'zod';

import type { RemoteClient } from '@/core/network/RpcClient';
import { err, ok, type Result } from '@/core/result/Result';
import type { Session } from '@/core/session/SessionStore';

import type { Ranking, RankingEntry } from '../../domain/entities/Ranking';
import type { RankingRemote } from '../../domain/repositories/RankingRemote';

// DTO de get_ranking (supabase/migrations/…_progress_rpc.sql). Otra forma = error de red.
const EntryDto = z.object({
  position: z.number().int(),
  first_name: z.string(),
  last_name: z.string(),
  city: z.string().nullable(),
  state: z.string(),
  country: z.string(),
  levels_completed: z.number().int(),
  topics_passed: z.number().int(),
  is_me: z.boolean(),
});

const RankingDto = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    total: z.number().int(),
    entries: z.array(EntryDto),
    me: EntryDto.nullable(),
  }),
  z.object({ status: z.literal('invalid_token') }),
]);

const toEntry = (dto: z.infer<typeof EntryDto>): RankingEntry => ({
  position: dto.position,
  firstName: dto.first_name,
  lastName: dto.last_name,
  city: dto.city,
  state: dto.state,
  country: dto.country,
  levelsCompleted: dto.levels_completed,
  topicsPassed: dto.topics_passed,
  isMe: dto.is_me,
});

export class SupabaseRankingRemoteDataSource implements RankingRemote {
  constructor(
    private readonly client: RemoteClient,
    private readonly session: { current(): Session | null },
  ) {}

  async fetch(limit: number): Promise<Result<Ranking, 'NETWORK' | 'INVALID_TOKEN'>> {
    const session = this.session.current();
    if (!session) return err('INVALID_TOKEN');
    try {
      const { data, error } = await this.client.rpc('get_ranking', {
        p_user_id: session.userId,
        p_token: session.apiToken,
        p_limit: limit,
      });
      const parsed = RankingDto.safeParse(data);
      if (error || !parsed.success) return err('NETWORK');

      const dto = parsed.data;
      if (dto.status === 'invalid_token') return err('INVALID_TOKEN');
      return ok({
        total: dto.total,
        entries: dto.entries.map(toEntry),
        me: dto.me ? toEntry(dto.me) : null,
      });
    } catch {
      return err('NETWORK');
    }
  }
}
