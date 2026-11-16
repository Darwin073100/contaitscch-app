import { AppText, Badge, Column, Logo } from '@/shared/ui';

type RegisterHeroProps = { mode: 'register' | 'login' };

/** Encabezado del registro y del acceso: logo, bienvenida y eslogan. */
export function RegisterHero({ mode }: RegisterHeroProps) {
  const register = mode === 'register';
  return (
    <Column gap="lg">
      <Badge
        label={register ? 'Registro de alumno' : 'Acceso de alumno'}
        tone="accent"
        icon="school"
        size="md"
        uppercase
      />
      <Column align="center" gap="sm">
        <Logo size="lg" badge />
        <AppText variant="title" align="center" accessibilityRole="header">
          {register ? '¡Únete a CONTAITSCCH!' : '¡Hola de nuevo!'}
        </AppText>
        <AppText variant="caption" tone="amber" weight="extrabold" align="center">
          Aprendizaje claro, práctico y gradual
        </AppText>
        <AppText variant="caption" align="center">
          Aprende contabilidad desde cero, nivel por nivel, con un ejercicio al final de cada tema.
        </AppText>
      </Column>
    </Column>
  );
}
