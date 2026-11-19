import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useContainer } from '@/composition/providers/AppProviders';

import type { LoginError } from '../../domain/usecases/LoginUseCase';
import {
  emptyLoginForm,
  loginFormSchema,
  type LoginFormInput,
  type LoginFormValues,
} from '../forms/loginFormSchema';
import { unexpectedErrorMessage } from './unexpectedError';

const formErrors: Record<LoginError, string> = {
  INVALID_CREDENTIALS: 'El correo o la contraseña no coinciden. Revisa e intenta de nuevo.',
  NETWORK: 'Necesitas conexión a internet para iniciar sesión. Revisa tu red e intenta de nuevo.',
};

/**
 * Inicio de sesión. Al abrir sesión trae el avance de la nube; después el guard de navegación
 * lleva a las pestañas (o a verificar el correo si aún no está verificado).
 */
export function useLoginViewModel() {
  const { auth } = useContainer();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: emptyLoginForm,
    mode: 'onTouched',
  });

  const onValid = async (values: LoginFormValues) => {
    setFormError(null);
    // Calcula el hash PBKDF2 (~1 s) y restaura el avance: el botón muestra "cargando"
    try {
      const result = await auth.login.execute(values);
      if (!result.ok) setFormError(formErrors[result.error]);
    } catch (error) {
      setFormError(unexpectedErrorMessage(error));
    }
  };

  // Sin argumentos: el evento de RN no es el BaseSyntheticEvent que espera handleSubmit.
  const submit = () => {
    void handleSubmit(onValid)();
  };

  return {
    control,
    focus: (name: keyof LoginFormInput) => setFocus(name),
    submit,
    submitting: isSubmitting,
    formError,
    openRegister: () => router.replace('/registro'),
  };
}
