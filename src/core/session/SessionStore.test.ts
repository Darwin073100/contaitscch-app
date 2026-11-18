import { canEnterApp, type Session } from './SessionStore';

const base: Session = {
  userId: 'u1',
  apiToken: 't',
  email: 'ana@correo.com',
  emailVerified: false,
  verificationRequired: true,
};

describe('canEnterApp', () => {
  it('sin sesión no entra', () => {
    expect(canEnterApp(null)).toBe(false);
  });

  it('con verificación requerida solo entra con el correo verificado', () => {
    expect(canEnterApp(base)).toBe(false);
    expect(canEnterApp({ ...base, emailVerified: true })).toBe(true);
  });

  it('sin verificación requerida entra aunque no haya verificado', () => {
    expect(canEnterApp({ ...base, verificationRequired: false })).toBe(true);
  });
});
