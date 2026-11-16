import { AppText, Button, Column } from '@/shared/ui';

type LoginPromptProps = {
  /** En el registro invita a iniciar sesión; en el acceso, a crear una cuenta. */
  mode: 'register' | 'login';
  onPress: () => void;
};

/** "¿Ya tienes cuenta? Iniciar sesión" / "¿Primera vez aquí? Crear mi cuenta". */
export function LoginPrompt({ mode, onPress }: LoginPromptProps) {
  const register = mode === 'register';
  return (
    <Column align="center">
      <AppText variant="caption">{register ? '¿Ya tienes cuenta?' : '¿Primera vez aquí?'}</AppText>
      <Button
        label={register ? 'Iniciar sesión' : 'Crear mi cuenta'}
        variant="link"
        size="sm"
        rightIcon={register ? 'login' : 'arrow-right'}
        onPress={onPress}
      />
    </Column>
  );
}
