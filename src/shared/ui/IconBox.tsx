import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName, type IconSize } from './Icon';

// Icono dentro de un fondo: tarjetas de nivel, objetivos, callouts, nodos de la ruta.
const iconBox = tv({
  slots: {
    box: 'items-center justify-center',
    // Insignia de esquina: candado de la meta del nivel
    corner:
      'absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full border border-line bg-surface',
  },
  variants: {
    tone: {
      // Tinte suave
      accent: { box: 'bg-accent/10' },
      amber: { box: 'bg-amber/15' },
      danger: { box: 'bg-err/10' },
      // Sólidos
      solid: { box: 'bg-accent' },
      amberSolid: { box: 'bg-amber' },
      navy: { box: 'bg-navy' },
      // Bloqueado / neutro
      locked: { box: 'bg-surface-alt' },
    },
    size: {
      sm: { box: 'h-8 w-8' },
      md: { box: 'h-11 w-11' },
      lg: { box: 'h-14 w-14' },
      xl: { box: 'h-20 w-20' },
    },
    shape: { rounded: { box: 'rounded-xl' }, circle: { box: 'rounded-full' } },
  },
  compoundVariants: [{ size: 'lg', shape: 'rounded', class: { box: 'rounded-2xl' } }],
  defaultVariants: { tone: 'accent', size: 'md', shape: 'rounded' },
});

export type IconBoxTone = NonNullable<VariantProps<typeof iconBox>['tone']>;

const iconColor: Record<IconBoxTone, ColorToken> = {
  accent: 'accent',
  amber: 'amber-text',
  danger: 'err',
  solid: 'accent-ink',
  amberSolid: 'amber-ink',
  navy: 'navy-ink',
  locked: 'faint',
};
const iconSize = { sm: 'sm', md: 'lg', lg: 'xl', xl: '2xl' } as const satisfies Record<
  string,
  IconSize
>;

export type IconBoxProps = VariantProps<typeof iconBox> & {
  icon: IconName;
  /** Icono pequeño en la esquina superior derecha (p. ej. `lock` en la meta bloqueada). */
  cornerIcon?: IconName;
};

export function IconBox({ icon, cornerIcon, tone = 'accent', size = 'md', shape }: IconBoxProps) {
  const s = iconBox({ tone, size, shape });
  return (
    <View className={s.box()}>
      <Icon name={icon} color={iconColor[tone]} size={iconSize[size]} />
      {cornerIcon && (
        <View className={s.corner()}>
          <Icon name={cornerIcon} color="dim" size="xs" />
        </View>
      )}
    </View>
  );
}
