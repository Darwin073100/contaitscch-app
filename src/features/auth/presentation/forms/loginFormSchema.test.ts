import { loginFormSchema } from './loginFormSchema';

describe('loginFormSchema', () => {
  it('normaliza el correo y acepta cualquier contraseña escrita', () => {
    expect(loginFormSchema.parse({ email: '  ANA@Correo.com ', password: ' x ' })).toEqual({
      email: 'ana@correo.com',
      password: ' x ',
    });
  });

  it('pide correo válido y contraseña', () => {
    const result = loginFormSchema.safeParse({ email: 'ana', password: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toEqual([
      'Escribe el correo con el que te registraste',
      'Escribe tu contraseña',
    ]);
  });
});
