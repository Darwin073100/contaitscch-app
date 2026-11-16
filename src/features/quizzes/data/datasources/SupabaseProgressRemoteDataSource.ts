import { z } from 'zod';

import type { RemoteClient } from '@/core/network/RpcClient';
import { err, ok, type Result } from '@/core/result/Result';
import type { Session } from '@/core/session/SessionStore';

import type { QuizProgress } from '../../domain/entities/QuizProgress';
import type {
  ProgressRemote,
  RemoteSyncError,
  RemoteSyncResponse,
} from '../../domain/repositories/ProgressRemote';

// DTOs de supabase/migrations/…_progress_rpc.sql. Una respuesta con otra forma se trata como error
// de red: la app no adivina.

/** timestamptz de Postgres ("2026-11-01T10:00:00+00:00") → ISO de la app ("…:00.000Z"). */
const isoDate = z.string().transform((value, ctx) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: 'custom', message: 'Fecha inválida' });
    return z.NEVER;
  }
  return date.toISOString();
});

const ProgressDto = z.object({
  quiz_id: z.number().int(),
  passed: z.boolean(),
  best_score: z.number().int(),
  attempts: z.number().int(),
  passed_at: isoDate.nullable(),
  updated_at: isoDate,
});

const SyncDto = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    generation: z.number().int(),
    synced_at: isoDate,
    progress: z.array(ProgressDto),
  }),
  z.object({
    status: z.literal('replace'),
    generation: z.number().int(),
    progress: z.array(ProgressDto),
  }),
  z.object({ status: z.literal('invalid_token') }),
  z.object({ status: z.literal('invalid_input') }),
]);

const ResetDto = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), generation: z.number().int() }),
  z.object({ status: z.literal('invalid_token') }),
]);

const toProgress = (dto: z.infer<typeof ProgressDto>): QuizProgress => ({
  quizId: dto.quiz_id,
  passed: dto.passed,
  bestScore: dto.best_score,
  attempts: dto.attempts,
  passedAt: dto.passed_at,
  updatedAt: dto.updated_at,
});

const toDto = (p: QuizProgress) => ({
  quiz_id: p.quizId,
  passed: p.passed,
  best_score: p.bestScore,
  attempts: p.attempts,
  passed_at: p.passedAt,
  updated_at: p.updatedAt,
});

/** Lo único que necesita de la sesión: el id y el api_token actuales. */
type CurrentSession = { current(): Session | null };

export class SupabaseProgressRemoteDataSource implements ProgressRemote {
  constructor(
    private readonly client: RemoteClient,
    private readonly session: CurrentSession,
  ) {}

  async sync(
    generation: number | null,
    pending: QuizProgress[],
  ): Promise<Result<RemoteSyncResponse, RemoteSyncError>> {
    const session = this.session.current();
    if (!session) return err('INVALID_TOKEN');
    const response = await this.call('sync_progress', SyncDto, {
      p_user_id: session.userId,
      p_token: session.apiToken,
      p_generation: generation,
      p_progress: pending.map(toDto),
    });
    if (!response.ok) return response;

    const dto = response.value;
    switch (dto.status) {
      case 'ok':
        return ok({
          status: 'ok',
          generation: dto.generation,
          syncedAt: dto.synced_at,
          progress: dto.progress.map(toProgress),
        });
      case 'replace':
        return ok({
          status: 'replace',
          generation: dto.generation,
          progress: dto.progress.map(toProgress),
        });
      case 'invalid_token':
        return err('INVALID_TOKEN');
      case 'invalid_input':
        return err('INVALID_INPUT');
    }
  }

  async reset(): Promise<Result<{ generation: number }, 'NETWORK' | 'INVALID_TOKEN'>> {
    const session = this.session.current();
    if (!session) return err('INVALID_TOKEN');
    const response = await this.call('reset_progress', ResetDto, {
      p_user_id: session.userId,
      p_token: session.apiToken,
    });
    if (!response.ok) return response;
    return response.value.status === 'ok'
      ? ok({ generation: response.value.generation })
      : err('INVALID_TOKEN');
  }

  /** Llama la RPC y valida la respuesta. Sin red, error de Postgres o forma inesperada: NETWORK. */
  private async call<T>(
    fn: string,
    schema: z.ZodType<T>,
    args: Record<string, unknown>,
  ): Promise<Result<T, 'NETWORK'>> {
    try {
      const { data, error } = await this.client.rpc(fn, args);
      if (error) return err('NETWORK');
      const parsed = schema.safeParse(data);
      return parsed.success ? ok(parsed.data) : err('NETWORK');
    } catch {
      return err('NETWORK');
    }
  }
}
