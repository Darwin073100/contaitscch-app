import { Image, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon } from './Icon';

// Logotipo oficial recortado en círculo (fuente: assets/images/LogoCircle.png).
const logoSource = require('../../../assets/images/logo.png');

const logo = tv({
  slots: {
    frame: 'items-center justify-center rounded-full',
    image: 'rounded-full',
    badge: 'absolute -bottom-1 -right-1 rounded-full bg-bg',
  },
  variants: {
    size: {
      sm: { image: 'h-8 w-8' },
      md: { image: 'h-16 w-16' },
      lg: { image: 'h-28 w-28' },
    },
    // Aro de superficie alrededor del círculo (hero del registro)
    ring: { true: { frame: 'border-8 border-surface' } },
  },
  defaultVariants: { size: 'md' },
});

type LogoProps = VariantProps<typeof logo> & {
  /** Insignia verde de verificado en la esquina (Home, registro). */
  verified?: boolean;
};

export function Logo({ size, ring, verified = false }: LogoProps) {
  const s = logo({ size, ring });
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
