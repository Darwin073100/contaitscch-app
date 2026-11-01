import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { getPasswordStrength } from '../forms/passwordStrength';
import {
  emptyRegisterForm,
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from '../forms/registerFormSchema';

/** Paso 1 del registro: formulario validado con Zod. */
export function useRegisterViewModel() {
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: emptyRegisterForm,
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });

  const onValid = async (values: RegisterFormValues) => {
    // Pendiente (spec 05): RegisterUserUseCase → hash PBKDF2, RPC `register` y `send-verification`.
    // Por ahora solo se avanza al paso 2 con el correo ya normalizado.
    router.push({ pathname: '/verificar-correo', params: { email: values.email } });
  };
  // Sin argumentos: el evento de RN no es el BaseSyntheticEvent que espera handleSubmit.
  const submit = () => {
    void handleSubmit(onValid)();
  };

  // Pendiente: la pantalla Login todavía no existe (spec 05, sección 7).
  const openLogin = () => {};

  return {
    control,
    focus: setFocus,
    submit,
    submitting: isSubmitting,
    passwordStrength: getPasswordStrength(password),
    openLogin,
  };
}
