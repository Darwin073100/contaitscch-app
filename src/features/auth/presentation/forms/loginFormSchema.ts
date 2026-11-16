import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Escribe el correo con el que te registraste')
    .pipe(z.email('Escribe el correo con el que te registraste')),
  // La contraseña no se recorta: los espacios cuentan.
  password: z.string().min(1, 'Escribe tu contraseña'),
});

export type LoginFormInput = z.input<typeof loginFormSchema>;
export type LoginFormValues = z.output<typeof loginFormSchema>;

export const emptyLoginForm: LoginFormInput = { email: '', password: '' };
