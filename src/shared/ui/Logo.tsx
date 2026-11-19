import { Image, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { Icon } from './Icon';

// Logotipo del cliente (fuente: spec/contaitscch-refactor/assets/logo-icon.webp).
const logoSource = require('../../../assets/images/logo-icon.webp');

const logo = tv({
  slots: {
    frame: 'items-center justify-center',
    badge:
      'absolute -bottom-2 -right-2 h-[38px] w-[38px] items-center justify-center rounded-full border-4 border-navy bg-amber',
  },
});

// Tamaño en números y no con clases: en web, Image ignora el alto y ancho de `className` y se
// dibuja a su tamaño natural. Mismos valores que antes (h-10/w-10, h-24/w-24, h-28/w-28).
const IMAGE_STYLE = {
  sm: { width: 40, height: 40, borderRadius: 11 },
  md: { width: 96, height: 96, borderRadius: 22 },
  lg: { width: 112, height: 112, borderRadius: 28 },
} as const;

type LogoProps = {
  size?: keyof typeof IMAGE_STYLE;
  /** Insignia ámbar con birrete en la esquina (registro y acceso). */
  badge?: boolean;
};

export function Logo({ size = 'md', badge = false }: LogoProps) {
  const s = logo();
  return (
    <View
      className={s.frame()}
      accessible
      accessibilityRole="image"
      accessibilityLabel="CONTAITSCCH"
    >
      <Image source={logoSource} style={IMAGE_STYLE[size]} resizeMode="cover" />
      {badge && (
        <View className={s.badge()}>
          <Icon name="school" color="amber-ink" size="md" />
        </View>
      )}
    </View>
  );
}
