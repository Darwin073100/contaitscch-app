import type { ReactNode } from 'react';

import { Screen, Stepper } from '@/shared/ui';

import { AuthBenefits } from './AuthBenefits';
import { LoginPrompt } from './LoginPrompt';
import { RegisterHero } from './RegisterHero';

const steps = ['Tus Datos', 'Verificación'];

type AuthLayoutProps = {
  /** 0 = Tus Datos, 1 = Verificación. */
  step: 0 | 1;
  onLoginPress: () => void;
  children: ReactNode;
};

/** Estructura compartida de los dos pasos: hero, stepper, contenido, enlace a login y beneficios. */
export function AuthLayout({ step, onLoginPress, children }: AuthLayoutProps) {
  return (
    <Screen scroll safeBottom keyboardAvoiding>
      <RegisterHero />
      <Stepper steps={steps} current={step} />
      {children}
      <LoginPrompt onPress={onLoginPress} />
      <AuthBenefits />
    </Screen>
  );
}
