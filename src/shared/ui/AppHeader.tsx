import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import { Logo } from './Logo';

/** Eslogan del cliente bajo el nombre de la app. */
const SLOGAN = 'Aprendizaje claro, práctico y gradual';

type AppHeaderProps = {
  /** Con onBack se muestra la flecha y el título; sin él, el logotipo, el nombre y el eslogan. */
  title?: string;
  onBack?: () => void;
  /** Icono de regresar: flecha (por omisión) o tache para salir de un ejercicio. */
  backIcon?: 'arrow-left' | 'close';
  /** Texto a la derecha: "Paso 2 de 4", "3 de 10". */
  counter?: string;
  /** Elemento extra junto al avatar (indicador de sincronización). */
  trailing?: ReactNode;
  /** Iniciales del usuario: muestra el avatar ámbar que abre el perfil. */
  initials?: string;
  onProfilePress?: () => void;
  /** Contenido bajo la barra, dentro de la franja navy (barra de avance del tema o del ejercicio). */
  children?: ReactNode;
};

/** Barra superior navy de las pantallas con sesión: marca o "atrás", estado y perfil. */
export function AppHeader({
  title,
  onBack,
  backIcon = 'arrow-left',
  counter,
  trailing,
  initials,
  onProfilePress,
  children,
}: AppHeaderProps) {
  return (
    <View className="gap-3 pb-3">
      <View className="min-h-[52px] flex-row items-center gap-2.5 pt-3">
        {onBack ? (
          <>
            <IconButton
              icon={backIcon}
              variant={backIcon === 'close' ? 'onNavyBoxed' : 'onNavy'}
              accessibilityLabel={backIcon === 'close' ? 'Salir' : 'Regresar'}
              onPress={onBack}
            />
            <Text
              className="flex-1 font-extrabold text-base text-navy-ink"
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </>
        ) : (
          <View className="flex-1 flex-row items-center gap-3">
            <Logo size="sm" />
            <View className="flex-1">
              <Text className="font-extrabold text-[17px] text-navy-ink" accessibilityRole="header">
                CONTAITSCCH
              </Text>
              <Text className="font-display text-xs text-amber" numberOfLines={1}>
                {SLOGAN}
              </Text>
            </View>
          </View>
        )}
        {counter && <Text className="font-extrabold text-sm text-navy-dim">{counter}</Text>}
        {trailing}
        {onProfilePress && (
          <Pressable
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel="Abrir mi perfil"
            className="active:opacity-80"
          >
            <Avatar
              tone="amber"
              size="sm"
              label={initials ?? ''}
              icon={initials ? undefined : 'account'}
            />
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
