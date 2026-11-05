import { setupVerification } from '../testing/verificationSetup';

describe('LogoutUseCase', () => {
  it('borra la sesión', async () => {
    const { logout, session } = await setupVerification({});

    await logout.execute();

    expect(session.current()).toBeNull();
  });
});
