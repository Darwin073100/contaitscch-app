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
import { unexpectedErrorMessage } from './unexpectedError';

const formErrors: Record<Exclude<RegisterUserError, 'EMAIL_TAKEN'>, string> = {
  NETWORK: 'Necesitas conexión a internet para crear tu cuenta. Revisa tu red e intenta de nuevo.',
  INVALID_INPUT: 'El servidor rechazó tus datos. Revísalos e intenta de nuevo.',
};

/**
 * Registro: valida el formulario y crea la cuenta. Si el servidor pide verificar el correo, envía el
 * código y abre la verificación; si no, la sesión ya permite entrar y el guard lleva al curso.
 */
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
    let created: Awaited<ReturnType<typeof auth.registerUser.execute>>;
    try {
      created = await auth.registerUser.execute({ ...values, city: city || null });
    } catch (error) {
      setFormError(unexpectedErrorMessage(error));
      return;
    }
    if (!created.ok) {
      if (created.error === 'EMAIL_TAKEN') {
        setError('email', { message: 'Este correo ya tiene una cuenta. Inicia sesión con él.' });
        setFocus('email');
      } else {
        setFormError(formErrors[created.error]);
      }
      return;
    }

    // Sin verificación requerida no hay nada más que hacer: el guard abre las pestañas
    if (!created.value.verificationRequired) return;

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

  const openLogin = () => router.replace('/login');

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
