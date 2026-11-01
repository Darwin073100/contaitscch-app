import { Image, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon } from './Icon';

// Temporal: icono de la app hasta tener el logotipo oficial de CONTAITSCCH en assets/images/.
const logoSource = require('../../../assets/images/icon.png');

const logo = tv({
  slots: {
    frame: 'items-center justify-center bg-card',
    image: 'rounded-xl',
    badge: 'absolute -bottom-1 -right-1 rounded-full bg-bg',
  },
  variants: {
    size: {
      sm: { frame: 'h-8 w-8 rounded-lg', image: 'h-8 w-8 rounded-lg' },
      md: { frame: 'h-16 w-16 rounded-2xl', image: 'h-12 w-12' },
      lg: { frame: 'h-28 w-28 rounded-3xl', image: 'h-20 w-20 rounded-2xl' },
    },
    shape: {
      rounded: {},
      circle: { frame: 'rounded-full border-8 border-surface' },
    },
  },
  defaultVariants: { size: 'md', shape: 'rounded' },
});

type LogoProps = VariantProps<typeof logo> & {
  /** Insignia verde de verificado en la esquina (Home, registro). */
  verified?: boolean;
};

export function Logo({ size, shape, verified = false }: LogoProps) {
  const s = logo({ size, shape });
  return (
    <View
      className={s.frame()}
      accessible
      accessibilityRole="image"
      accessibilityLabel="CONTAITSCCH"
    >
      <Image source={logoSource} className={s.image()} resizeMode="contain" />
      {verified && (
        <View className={s.badge()}>
          <Icon name="check-circle" color="primary" size={size === 'lg' ? 'lg' : 'sm'} />
        </View>
      )}
    </View>
  );
}
