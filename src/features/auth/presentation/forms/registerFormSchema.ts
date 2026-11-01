import { z } from 'zod';

// Reglas de la historia "Registro de usuario" (docs/USER_STORIES.md).
const MIN_NAME = 3;
export const MIN_PASSWORD = 6;

export const registerFormSchema = z.object({
  firstName: z.string().trim().min(MIN_NAME, `Mínimo ${MIN_NAME} caracteres`),
  lastName: z.string().trim().min(MIN_NAME, `Mínimo ${MIN_NAME} caracteres`),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Mínimo 3 caracteres')
    .pipe(z.email('Escribe un correo válido, por ejemplo nombre@correo.com')),
  // La contraseña no se recorta: los espacios cuentan.
  password: z.string().min(MIN_PASSWORD, `Mínimo ${MIN_PASSWORD} caracteres`),
  country: z.string().trim().min(1, 'El país es obligatorio'),
  state: z.string().trim().min(1, 'El estado es obligatorio'),
  city: z.string().trim(),
});

export type RegisterFormInput = z.input<typeof registerFormSchema>;
export type RegisterFormValues = z.output<typeof registerFormSchema>;

export const emptyRegisterForm: RegisterFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  country: '',
  state: '',
  city: '',
};
