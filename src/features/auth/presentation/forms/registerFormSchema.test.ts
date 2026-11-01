import { emptyRegisterForm, registerFormSchema } from './registerFormSchema';

const valid = {
  firstName: 'Carlos',
  lastName: 'Gómez Morales',
  email: '  Carlos@Correo.com ',
  password: 'secreta1',
  country: 'México',
  state: 'Veracruz',
  city: '',
};

const errorsOf = (input: unknown) => {
  const result = registerFormSchema.safeParse(input);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('registerFormSchema', () => {
  it('acepta datos válidos, normaliza el correo y deja la ciudad opcional', () => {
    const result = registerFormSchema.parse(valid);

    expect(result.email).toBe('carlos@correo.com');
    expect(result.city).toBe('');
  });

  it('exige mínimo 3 caracteres en nombre y apellidos (sin contar espacios)', () => {
    const errors = errorsOf({ ...valid, firstName: '  Al ', lastName: 'Li' });

    expect(errors.firstName).toEqual(['Mínimo 3 caracteres']);
    expect(errors.lastName).toEqual(['Mínimo 3 caracteres']);
  });

  it('rechaza un correo sin @', () => {
    expect(errorsOf({ ...valid, email: 'carlos.correo.com' }).email).toBeDefined();
  });

  it('exige contraseña de 6 caracteres, país y estado', () => {
    const errors = errorsOf({
      ...emptyRegisterForm,
      ...valid,
      password: '12345',
      country: ' ',
      state: '',
    });

    expect(errors.password).toEqual(['Mínimo 6 caracteres']);
    expect(errors.country).toEqual(['El país es obligatorio']);
    expect(errors.state).toEqual(['El estado es obligatorio']);
  });
});
