import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName, type IconSize } from './Icon';

// Icono dentro de un fondo: tarjetas de nivel, objetivos, regla de oro, nodos del temario.
const iconBox = tv({
  slots: {
    box: 'items-center justify-center',
    // Insignia de esquina: candado del examen final
    corner:
      'absolute -right-1.5 -top-1.5 h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-surface',
  },
  variants: {
    tone: {
      primary: { box: 'bg-primary' },
      primarySoft: { box: 'bg-primary/15' },
      accent: { box: 'bg-accent' },
      accentSoft: { box: 'bg-accent/15' },
      info: { box: 'bg-info' },
      infoSoft: { box: 'bg-info/25' },
      streakSoft: { box: 'bg-streak/15' },
      neutral: { box: 'bg-surface' },
    },
    size: {
      sm: { box: 'h-8 w-8' },
      md: { box: 'h-11 w-11' },
      lg: { box: 'h-14 w-14' },
      xl: { box: 'h-20 w-20' },
    },
    shape: { rounded: { box: 'rounded-2xl' }, circle: { box: 'rounded-full' } },
  },
  compoundVariants: [{ size: 'sm', shape: 'rounded', class: { box: 'rounded-xl' } }],
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

export type IconBoxProps = VariantProps<typeof iconBox> & {
  icon: IconName;
  /** Icono pequeño en la esquina superior derecha (p. ej. `lock` en el examen bloqueado). */
  cornerIcon?: IconName;
};

export function IconBox({ icon, cornerIcon, tone = 'neutral', size = 'md', shape }: IconBoxProps) {
  const s = iconBox({ tone, size, shape });
  return (
    <View className={s.box()}>
      <Icon name={icon} color={iconColor[tone]} size={iconSize[size]} />
      {cornerIcon && (
        <View className={s.corner()}>
          <Icon name={cornerIcon} color="muted" size="xs" />
        </View>
      )}
    </View>
  );
}
