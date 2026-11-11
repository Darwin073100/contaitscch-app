import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { IconButton } from './IconButton';
import { Logo } from './Logo';

const headerTitle = tv({
  base: 'flex-1 font-display text-lg text-white',
  variants: { brand: { true: 'text-primary' } },
});

type AppHeaderProps = {
  /** Con onBack se muestra la flecha y el título; sin él, el logotipo y "CONTAITSCCH". */
  title?: string;
  onBack?: () => void;
  onProfilePress?: () => void;
};

/** Barra superior de todas las pantallas con sesión: marca o "atrás" y perfil. */
export function AppHeader({ title, onBack, onProfilePress }: AppHeaderProps) {
  return (
    <View className="h-14 flex-row items-center gap-2">
      {onBack ? (
        <IconButton
          icon="arrow-left"
          variant="ghost"
          accessibilityLabel="Regresar"
          onPress={onBack}
        />
      ) : (
        <Logo size="sm" />
      )}
      <Text
        className={headerTitle({ brand: !onBack })}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {onBack ? title : 'CONTAITSCCH'}
      </Text>
      {onProfilePress && (
        <IconButton
          icon="account-outline"
          variant="soft"
          size="sm"
          accessibilityLabel="Perfil"
          onPress={onProfilePress}
        />
      )}
    </View>
  );
}
