import type { ReactNode } from 'react';

import { Screen, Stepper } from '@/shared/ui';

import { AuthBenefits } from './AuthBenefits';
import { LoginPrompt } from './LoginPrompt';
import { RegisterHero } from './RegisterHero';

const steps = ['Tus datos', 'Verificación'];

type AuthLayoutProps = {
  /** Registro (con sus 2 pasos) o acceso. */
  mode?: 'register' | 'login';
  /**
   * Paso del registro (0 = Tus datos, 1 = Verificación). Solo la verificación lo pasa: el registro no
   * sabe si habrá segundo paso hasta que el servidor responde (la verificación es opcional).
   */
  step?: 0 | 1;
  /** Abre el acceso desde el registro, o el registro desde el acceso. */
  onSwitch: () => void;
  children: ReactNode;
};

/** Estructura del registro y del acceso: hero, pasos, contenido, enlace contrario y beneficios. */
export function AuthLayout({ mode = 'register', step, onSwitch, children }: AuthLayoutProps) {
  return (
    <Screen scroll safeBottom keyboardAvoiding>
      <RegisterHero mode={mode} />
      {mode === 'register' && step !== undefined && <Stepper steps={steps} current={step} />}
      {children}
      <LoginPrompt mode={mode} onPress={onSwitch} />
      <AuthBenefits />
    </Screen>
  );
}
