import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { formatCountdown, useCountdown } from '@/shared/hooks';

export const CODE_LENGTH = 6;
// Igual que el cooldown de `create_verification_code` en Postgres (ARCHITECTURE.md).
const RESEND_SECONDS = 45;

/** Paso 2 del registro: código OTP de 6 dígitos y reenvío cada 45 s. */
export function useVerifyEmailViewModel() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const countdown = useCountdown(RESEND_SECONDS);

  const canVerify = code.length === CODE_LENGTH;

  const verify = () => {
    if (!canVerify) return;
    // Pendiente (spec 05): VerifyEmailCodeUseCase → RPC `verify_email`; mensajes por respuesta.
    router.replace('/');
  };

  const resend = () => {
    // Pendiente (spec 05): RequestVerificationCodeUseCase → Edge Function `send-verification`.
    setCode('');
    countdown.restart();
  };

  // El paso 1 sigue en la pila con sus datos; sin historial (enlace profundo) se abre vacío.
  const editData = () => (router.canGoBack() ? router.back() : router.replace('/registro'));

  // Pendiente: la pantalla Login todavía no existe (spec 05, sección 7).
  const openLogin = () => {};

  return {
    email,
    code,
    setCode,
    canVerify,
    verify,
    canResend: countdown.done,
    resendLabel: `Reenviar en ${formatCountdown(countdown.remaining)}`,
    resend,
    editData,
    openLogin,
  };
}
