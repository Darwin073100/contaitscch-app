import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName, type IconSize } from './Icon';

// Icono dentro de un fondo: tarjetas de nivel, objetivos, regla de oro, nodos del temario.
const iconBox = tv({
  base: 'items-center justify-center',
  variants: {
    tone: {
      primary: 'bg-primary',
      primarySoft: 'bg-primary/15',
      accent: 'bg-accent',
      accentSoft: 'bg-accent/15',
      info: 'bg-info',
      infoSoft: 'bg-info/25',
      streakSoft: 'bg-streak/15',
      neutral: 'bg-surface',
    },
    size: { sm: 'h-8 w-8', md: 'h-11 w-11', lg: 'h-14 w-14', xl: 'h-20 w-20' },
    shape: { rounded: 'rounded-2xl', circle: 'rounded-full' },
  },
  compoundVariants: [{ size: 'sm', shape: 'rounded', class: 'rounded-xl' }],
  defaultVariants: { tone: 'neutral', size: 'md', shape: 'rounded' },
});

type IconBoxTone = NonNullable<VariantProps<typeof iconBox>['tone']>;

const iconColor: Record<IconBoxTone, ColorToken> = {
  primary: 'bg',
  primarySoft: 'primary',
  accent: 'bg',
  accentSoft: 'accent',
  info: 'white',
  infoSoft: 'accent',
  streakSoft: 'streak',
  neutral: 'muted',
};
const iconSize = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' } as const satisfies Record<
  string,
  IconSize
>;

export type IconBoxProps = VariantProps<typeof iconBox> & { icon: IconName };

export function IconBox({ icon, tone = 'neutral', size = 'md', shape }: IconBoxProps) {
  return (
    <View className={iconBox({ tone, size, shape })}>
      <Icon name={icon} color={iconColor[tone]} size={iconSize[size]} />
    </View>
  );
}
