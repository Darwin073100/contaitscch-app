import { err, ok } from '@/core/result/Result';

import { setupVerification } from '../testing/verificationSetup';

describe('VerifyEmailCodeUseCase', () => {
  it('código correcto: marca verificado en SQLite y en la sesión', async () => {
    const { verify, calls, verifiedUsers, session } = await setupVerification({});

    expect(await verify.execute(' 724913 ')).toEqual(ok(undefined));
    expect(calls).toEqual(['verify:id-1:token-1:724913']);
    expect(verifiedUsers).toEqual(['id-1']);
    expect(session.current()?.emailVerified).toBe(true);
  });

  it.each(['72491', 'abcdef', '1234567'])(
    '"%s" no tiene 6 dígitos: INVALID_CODE sin llamar al servidor',
    async (code) => {
      const { verify, calls } = await setupVerification({});

      expect(await verify.execute(code)).toEqual(err('INVALID_CODE'));
      expect(calls).toEqual([]);
    },
  );

  it.each(['INVALID_CODE', 'EXPIRED', 'TOO_MANY_ATTEMPTS', 'NETWORK'] as const)(
    'el servidor responde %s: no marca nada',
    async (error) => {
      const { verify, verifiedUsers, session } = await setupVerification({ verify: err(error) });

      expect(await verify.execute('724913')).toEqual(err(error));
      expect(verifiedUsers).toEqual([]);
      expect(session.current()?.emailVerified).toBe(false);
    },
  );

  it('sin sesión: NO_SESSION', async () => {
    const { verify } = await setupVerification({ session: null });

    expect(await verify.execute('724913')).toEqual(err('NO_SESSION'));
  });
});
