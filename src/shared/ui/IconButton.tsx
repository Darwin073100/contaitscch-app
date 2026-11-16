import { Pressable, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName, type IconSize } from './Icon';

const iconButton = tv({
  base: 'items-center justify-center active:opacity-70',
  variants: {
    variant: {
      surface: 'bg-surface-alt',
      ghost: 'bg-transparent',
      // Sobre la topbar navy
      onNavy: 'bg-transparent active:bg-navy-ink/10',
      onNavyBoxed: 'bg-navy-ink/15',
    },
    size: { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-14 w-14' },
    shape: { rounded: 'rounded-xl', circle: 'rounded-full' },
  },
  defaultVariants: { variant: 'surface', size: 'md', shape: 'circle' },
});

type IconButtonVariant = NonNullable<VariantProps<typeof iconButton>['variant']>;

const iconColor: Record<IconButtonVariant, ColorToken> = {
  surface: 'dim',
  ghost: 'dim',
  onNavy: 'navy-ink',
  onNavyBoxed: 'navy-ink',
};
const iconSize = { sm: 'md', md: 'lg', lg: 'lg' } as const satisfies Record<string, IconSize>;

type IconButtonProps = Omit<PressableProps, 'children'> &
  VariantProps<typeof iconButton> & {
    icon: IconName;
    /** Obligatorio: el botón no tiene texto visible. */
    accessibilityLabel: string;
  };

/** Botón solo con icono: atrás, cerrar, otra frase. Mínimo 36 px; usa `md` (44 px) cuando se pueda. */
export function IconButton({
  icon,
  variant = 'surface',
  size = 'md',
  shape,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={iconButton({ variant, size, shape })}
      accessibilityRole="button"
      hitSlop={size === 'sm' ? 6 : undefined}
      {...props}
    >
      <Icon name={icon} color={iconColor[variant]} size={iconSize[size]} />
    </Pressable>
  );
}
