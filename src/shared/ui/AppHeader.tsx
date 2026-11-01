import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { IconButton } from './IconButton';
import { Logo } from './Logo';
import { StatPill } from './StatPill';

const headerTitle = tv({
  base: 'flex-1 font-display text-lg text-white',
  variants: { brand: { true: 'text-primary' } },
});

type AppHeaderProps = {
  /** Con onBack se muestra la flecha y el título; sin él, el logotipo y "CONTAITSCCH". */
  title?: string;
  onBack?: () => void;
  streak?: number;
  xp?: number;
  /** Vidas infinitas: solo elemento visual (ver observación 3 de ARCHITECTURE.md). */
  showLives?: boolean;
  onProfilePress?: () => void;
};

/** Barra superior de todas las pantallas con sesión: marca o "atrás", estadísticas y perfil. */
export function AppHeader({
  title,
  onBack,
  streak,
  xp,
  showLives = true,
  onProfilePress,
}: AppHeaderProps) {
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
      <View className="flex-row items-center gap-1.5">
        {streak !== undefined && (
          <StatPill
            icon="fire"
            iconColor="streak"
            value={streak}
            accessibilityLabel={`Racha de ${streak} días`}
          />
        )}
        {xp !== undefined && (
          <StatPill
            icon="lightning-bolt"
            iconColor="accent"
            value={xp}
            accessibilityLabel={`${xp} XP`}
          />
        )}
        {showLives && (
          <StatPill
            icon="heart-outline"
            iconColor="danger"
            value="∞"
            accessibilityLabel="Vidas ilimitadas"
          />
        )}
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
    </View>
  );
}
