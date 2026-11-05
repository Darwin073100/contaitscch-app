import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useContainer } from '@/composition/providers/AppProviders';

import type { RegisterUserError } from '../../domain/usecases/RegisterUserUseCase';
import { getPasswordStrength } from '../forms/passwordStrength';
import {
  emptyRegisterForm,
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from '../forms/registerFormSchema';

const formErrors: Record<Exclude<RegisterUserError, 'EMAIL_TAKEN'>, string> = {
  NETWORK: 'Necesitas conexión a internet para crear tu cuenta. Revisa tu red e intenta de nuevo.',
  INVALID_INPUT: 'El servidor rechazó tus datos. Revísalos e intenta de nuevo.',
};

/** Paso 1 del registro: valida el formulario, crea la cuenta y pide el código de verificación. */
export function useRegisterViewModel() {
  const { auth } = useContainer();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setFocus,
    setError,
    formState: { isSubmitting },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: emptyRegisterForm,
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });

  const onValid = async ({ city, ...values }: RegisterFormValues) => {
    setFormError(null);
    // Calcula el hash PBKDF2 (~1 s): el botón muestra "cargando" mientras tanto
    const created = await auth.registerUser.execute({ ...values, city: city || null });
    if (!created.ok) {
      if (created.error === 'EMAIL_TAKEN') {
        setError('email', { message: 'Este correo ya tiene una cuenta. Inicia sesión con él.' });
        setFocus('email');
      } else {
        setFormError(formErrors[created.error]);
      }
      return;
    }

    // La cuenta ya existe aunque el correo no salga: en la verificación se puede reenviar
    const code = await auth.requestVerificationCode.execute();
    router.push({
      pathname: '/verificar-correo',
      params: code.ok
        ? { resendIn: String(code.value.resendInSeconds) }
        : { resendIn: '0', sendFailed: '1' },
    });
  };
  // Sin argumentos: el evento de RN no es el BaseSyntheticEvent que espera handleSubmit.
  const submit = () => {
    void handleSubmit(onValid)();
  };

  // Pendiente (3c): pantalla de Login.
  const openLogin = () => {};

  return {
    control,
    focus: setFocus,
    submit,
    submitting: isSubmitting,
    formError,
    passwordStrength: getPasswordStrength(password),
    openLogin,
  };
}
