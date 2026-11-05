import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';
import { useSession } from '@/composition/providers/useSession';
import { formatCountdown, useCountdown } from '@/shared/hooks';

import type { RequestVerificationCodeError } from '../../domain/usecases/RequestVerificationCodeUseCase';
import type { VerifyEmailCodeError } from '../../domain/usecases/VerifyEmailCodeUseCase';

export const CODE_LENGTH = 6;
// Igual que el cooldown de `create_verification_code` en Postgres.
const RESEND_SECONDS = 45;

export type VerifyNotice = { tone: 'danger' | 'accent'; text: string };

const danger = (text: string): VerifyNotice => ({ tone: 'danger', text });

const SESSION_CHANGED = danger(
  'Tu registro cambió (quizá desde otro dispositivo). Corrige tus datos y vuelve a registrarte.',
);
const SEND_FAILED = danger(
  'No pudimos enviar el código. Revisa tu conexión y toca **Reenviar código**.',
);

// Mensajes de ARCHITECTURE.md (tabla de respuestas de verify_email)
const verifyNotices: Record<Exclude<VerifyEmailCodeError, 'EXPIRED'>, VerifyNotice> = {
  INVALID_CODE: danger('Código incorrecto, revisa tu correo.'),
  TOO_MANY_ATTEMPTS: danger('Demasiados intentos. Solicita otro código.'),
  NO_CODE: danger('Todavía no tienes un código. Toca **Reenviar código**.'),
  NETWORK: danger('Necesitas conexión para verificar tu correo.'),
  INVALID_TOKEN: SESSION_CHANGED,
  NO_SESSION: SESSION_CHANGED,
};

/** Segundos iniciales del contador: los que indicó el registro, o 45 al reabrir la app. */
function initialWait(param: string | undefined): number {
  const seconds = Number(param);
  return param !== undefined && Number.isFinite(seconds) ? Math.max(0, seconds) : RESEND_SECONDS;
}

/** Paso 2 del registro: código OTP de 6 dígitos y reenvío con la espera que indique el servidor. */
export function useVerifyEmailViewModel() {
  const { auth } = useContainer();
  const session = useSession();
  const params = useLocalSearchParams<{ resendIn?: string; sendFailed?: string }>();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState<VerifyNotice | null>(params.sendFailed ? SEND_FAILED : null);
  const countdown = useCountdown(initialWait(params.resendIn));

  const canVerify = code.length === CODE_LENGTH && !verifying;

  const enterCourse = () => router.replace('/');

  const resend = async () => {
    setCode('');
    const result = await auth.requestVerificationCode.execute();
    if (result.ok) {
      countdown.restart(result.value.resendInSeconds);
      setNotice(
        result.value.sent
          ? { tone: 'accent', text: 'Te enviamos un código nuevo.' }
          : { tone: 'accent', text: 'Espera unos segundos para reenviar.' },
      );
      return result.value.sent;
    }
    const error: RequestVerificationCodeError = result.error;
    if (error === 'ALREADY_VERIFIED') {
      enterCourse();
      return false;
    }
    countdown.restart(0);
    setNotice(error === 'SEND_FAILED' ? SEND_FAILED : SESSION_CHANGED);
    return false;
  };

  const verify = async () => {
    if (!canVerify) return;
    setVerifying(true);
    setNotice(null);
    const result = await auth.verifyEmailCode.execute(code);
    setVerifying(false);
    // El guard ya cambió a las pestañas al marcar la sesión como verificada
    if (result.ok) return enterCourse();

    if (result.error === 'EXPIRED') {
      // Si el reenvío falla, se queda su propio aviso (sin conexión, etc.)
      if (await resend()) setNotice(danger('El código venció, te enviamos uno nuevo.'));
      return;
    }
    if (result.error === 'INVALID_CODE') setCode('');
    setNotice(verifyNotices[result.error]);
  };

  // El paso 1 sigue en la pila con sus datos; sin historial (app reabierta) se abre vacío.
  const editData = () => (router.canGoBack() ? router.back() : router.replace('/registro'));

  // Pendiente (3c): pantalla de Login.
  const openLogin = () => {};

  return {
    email: session?.email,
    code,
    setCode,
    canVerify,
    verifying,
    verify,
    notice,
    canResend: countdown.done,
    resendLabel: `Reenviar en ${formatCountdown(countdown.remaining)}`,
    resend,
    editData,
    openLogin,
  };
}
