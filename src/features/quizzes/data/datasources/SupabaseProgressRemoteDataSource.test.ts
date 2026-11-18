import type { RemoteClient, RpcResponse } from '@/core/network/RpcClient';
import type { Session } from '@/core/session/SessionStore';

import { SupabaseProgressRemoteDataSource } from './SupabaseProgressRemoteDataSource';

const session: Session = {
  userId: 'u1',
  apiToken: 't1',
  email: 'ana@correo.com',
  emailVerified: true,
  verificationRequired: true,
};

function client(response: RpcResponse | (() => never)) {
  const rpc = jest.fn(async () => (typeof response === 'function' ? response() : response));
  return { rpc, functions: { invoke: jest.fn() } } as unknown as RemoteClient & {
    rpc: typeof rpc;
  };
}

const row = {
  quiz_id: 101,
  passed: true,
  best_score: 2,
  attempts: 1,
  passed_at: '2026-11-01T10:00:00+00:00',
  updated_at: '2026-11-01T10:00:00.5+00:00',
};

const progress = {
  quizId: 101,
  passed: true,
  bestScore: 2,
  attempts: 1,
  passedAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.500Z',
};

describe('SupabaseProgressRemoteDataSource', () => {
  it('manda las filas en snake_case y normaliza las fechas a ISO', async () => {
    const c = client({
      data: {
        status: 'ok',
        generation: 0,
        synced_at: '2026-11-15T12:00:00+00:00',
        progress: [row],
      },
      error: null,
    });

    const result = await new SupabaseProgressRemoteDataSource(c, { current: () => session }).sync(
      0,
      [progress],
    );

    expect(c.rpc).toHaveBeenCalledWith('sync_progress', {
      p_user_id: 'u1',
      p_token: 't1',
      p_generation: 0,
      p_progress: [{ ...row, passed_at: progress.passedAt, updated_at: progress.updatedAt }],
    });
    expect(result).toEqual({
      ok: true,
      value: {
        status: 'ok',
        generation: 0,
        syncedAt: '2026-11-15T12:00:00.000Z',
        progress: [progress],
      },
    });
  });

  it('replace trae el avance de la nube para reemplazar el local', async () => {
    const c = client({ data: { status: 'replace', generation: 3, progress: [row] }, error: null });

    const result = await new SupabaseProgressRemoteDataSource(c, { current: () => session }).sync(
      null,
      [],
    );

    expect(result).toEqual({
      ok: true,
      value: { status: 'replace', generation: 3, progress: [progress] },
    });
  });

  it.each([
    ['token rechazado', { data: { status: 'invalid_token' }, error: null }, 'INVALID_TOKEN'],
    ['lote rechazado', { data: { status: 'invalid_input' }, error: null }, 'INVALID_INPUT'],
    ['error de Postgres', { data: null, error: { message: 'x' } }, 'NETWORK'],
    ['respuesta con otra forma', { data: { status: 'ok' }, error: null }, 'NETWORK'],
  ])('%s', async (_name, response, error) => {
    const remote = new SupabaseProgressRemoteDataSource(client(response), {
      current: () => session,
    });

    expect(await remote.sync(0, [])).toEqual({ ok: false, error });
  });

  it('sin red (excepción del cliente): NETWORK', async () => {
    const c = client(() => {
      throw new Error('fetch failed');
    });

    expect(
      await new SupabaseProgressRemoteDataSource(c, { current: () => session }).sync(0, []),
    ).toEqual({ ok: false, error: 'NETWORK' });
  });

  it('sin sesión no llama a la nube', async () => {
    const c = client({ data: null, error: null });

    expect(await new SupabaseProgressRemoteDataSource(c, { current: () => null }).reset()).toEqual({
      ok: false,
      error: 'INVALID_TOKEN',
    });
    expect(c.rpc).not.toHaveBeenCalled();
  });

  it('reset devuelve la nueva generación', async () => {
    const c = client({ data: { status: 'ok', generation: 4 }, error: null });

    const result = await new SupabaseProgressRemoteDataSource(c, {
      current: () => session,
    }).reset();

    expect(c.rpc).toHaveBeenCalledWith('reset_progress', { p_user_id: 'u1', p_token: 't1' });
    expect(result).toEqual({ ok: true, value: { generation: 4 } });
  });
});
