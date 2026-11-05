import { err, ok } from '@/core/result/Result';

import { setupVerification } from '../testing/verificationSetup';

describe('RequestVerificationCodeUseCase', () => {
  it('pide el código con las credenciales de la sesión', async () => {
    const { request, calls } = await setupVerification({});

    expect(await request.execute()).toEqual(ok({ sent: true, resendInSeconds: 45 }));
    expect(calls).toEqual(['request:id-1']);
  });

  it('si el correo ya estaba verificado lo refleja en SQLite y en la sesión', async () => {
    const { request, verifiedUsers, session } = await setupVerification({
      request: err('ALREADY_VERIFIED'),
    });

    expect(await request.execute()).toEqual(err('ALREADY_VERIFIED'));
    expect(verifiedUsers).toEqual(['id-1']);
    expect(session.current()?.emailVerified).toBe(true);
  });

  it('SEND_FAILED no cambia la sesión', async () => {
    const { request, session } = await setupVerification({ request: err('SEND_FAILED') });

    expect(await request.execute()).toEqual(err('SEND_FAILED'));
    expect(session.current()?.emailVerified).toBe(false);
  });
});
