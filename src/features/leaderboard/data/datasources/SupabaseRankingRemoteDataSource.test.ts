import type { RemoteClient, RpcResponse } from '@/core/network/RpcClient';
import type { Session } from '@/core/session/SessionStore';

import { SupabaseRankingRemoteDataSource } from './SupabaseRankingRemoteDataSource';

const session: Session = { userId: 'u1', apiToken: 't1', email: 'a@b.c', emailVerified: true, verificationRequired: true };

const client = (response: RpcResponse) => {
  const rpc = jest.fn(async () => response);
  return { rpc, functions: { invoke: jest.fn() } } as unknown as RemoteClient & {
    rpc: typeof rpc;
  };
};

const entry = {
  position: 1,
  first_name: 'Ana',
  last_name: 'López',
  city: null,
  state: 'Chiapas',
  country: 'México',
  levels_completed: 1,
  topics_passed: 5,
  is_me: true,
};

describe('SupabaseRankingRemoteDataSource', () => {
  it('pide el ranking con id, token y límite, y lo traduce a camelCase', async () => {
    const c = client({
      data: { status: 'ok', total: 1, entries: [entry], me: entry },
      error: null,
    });

    const result = await new SupabaseRankingRemoteDataSource(c, { current: () => session }).fetch(
      100,
    );

    expect(c.rpc).toHaveBeenCalledWith('get_ranking', {
      p_user_id: 'u1',
      p_token: 't1',
      p_limit: 100,
    });
    const mapped = {
      position: 1,
      firstName: 'Ana',
      lastName: 'López',
      city: null,
      state: 'Chiapas',
      country: 'México',
      levelsCompleted: 1,
      topicsPassed: 5,
      isMe: true,
    };
    expect(result).toEqual({ ok: true, value: { total: 1, entries: [mapped], me: mapped } });
  });

  it('token rechazado, error o respuesta con otra forma', async () => {
    const fetch = (response: RpcResponse) =>
      new SupabaseRankingRemoteDataSource(client(response), { current: () => session }).fetch(10);

    expect(await fetch({ data: { status: 'invalid_token' }, error: null })).toEqual({
      ok: false,
      error: 'INVALID_TOKEN',
    });
    expect(await fetch({ data: null, error: { message: 'x' } })).toEqual({
      ok: false,
      error: 'NETWORK',
    });
    expect(await fetch({ data: { status: 'ok', total: 1 }, error: null })).toEqual({
      ok: false,
      error: 'NETWORK',
    });
  });
});
