import { AppText, Button, Column } from '@/shared/ui';

type LoginPromptProps = {
  onPress: () => void;
};

/** "¿Ya tienes cuenta activa?" + enlace a Iniciar sesión. */
export function LoginPrompt({ onPress }: LoginPromptProps) {
  return (
    <Column align="center">
      <AppText variant="caption">¿Ya tienes cuenta activa?</AppText>
      <Button
        label="Iniciar Sesión en CONTAITSCCH"
        variant="ghost"
        size="sm"
        rightIcon="login"
        onPress={onPress}
      />
    </Column>
  );
}
