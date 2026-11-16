import { Image, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon } from './Icon';

// Logotipo del cliente (fuente: spec/contaitscch-refactor/assets/logo-icon.webp).
const logoSource = require('../../../assets/images/logo-icon.webp');

const logo = tv({
  slots: {
    frame: 'items-center justify-center',
    image: '',
    badge:
      'absolute -bottom-2 -right-2 h-[38px] w-[38px] items-center justify-center rounded-full border-4 border-navy bg-amber',
  },
  variants: {
    size: {
      sm: { image: 'h-10 w-10 rounded-[11px]' },
      md: { image: 'h-24 w-24 rounded-[22px]' },
      lg: { image: 'h-28 w-28 rounded-[28px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

type LogoProps = VariantProps<typeof logo> & {
  /** Insignia ámbar con birrete en la esquina (registro y acceso). */
  badge?: boolean;
};

export function Logo({ size, badge = false }: LogoProps) {
  const s = logo({ size });
  return (
    <View
      className={s.frame()}
      accessible
      accessibilityRole="image"
      accessibilityLabel="CONTAITSCCH"
    >
      <Image source={logoSource} className={s.image()} resizeMode="cover" />
      {badge && (
        <View className={s.badge()}>
          <Icon name="school" color="amber-ink" size="md" />
        </View>
      )}
    </View>
  );
}
