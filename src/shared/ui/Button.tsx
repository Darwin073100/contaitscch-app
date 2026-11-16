import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { useThemeColors, type ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

// Botón "3D" del prototipo: borde inferior más oscuro (rim) que se aplana al presionar.
const button = tv({
  slots: {
    container:
      'flex-row items-center justify-center gap-2 rounded-[14px] border-b-4 px-6 active:translate-y-[3px] active:border-b',
    label: 'font-extrabold',
  },
  variants: {
    variant: {
      primary: { container: 'border-accent-rim bg-accent', label: 'text-accent-ink' },
      navy: { container: 'border-navy-rim bg-navy', label: 'text-navy-ink' },
      amber: { container: 'border-amber-rim bg-amber', label: 'text-amber-ink' },
      danger: { container: 'border-err bg-err', label: 'text-err-ink' },
      ghost: { container: 'border-2 border-b-4 border-line bg-surface', label: 'text-text' },
      // Solo texto (enlaces como "Volver a la ruta")
      link: { container: 'border-b-0 bg-transparent active:translate-y-0', label: 'text-accent' },
    },
    size: {
      sm: { container: 'h-11 self-start px-4', label: 'text-[15px]' },
      md: { container: 'h-12', label: 'text-base' },
      lg: { container: 'h-14', label: 'text-[17px]' },
    },
    disabled: {
      true: {
        container: 'border-line bg-surface-alt active:translate-y-0 active:border-b-4',
        label: 'text-faint',
      },
    },
  },
  defaultVariants: { variant: 'primary', size: 'lg' },
});

type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

const contentColor: Record<ButtonVariant, ColorToken> = {
  primary: 'accent-ink',
  navy: 'navy-ink',
  amber: 'amber-ink',
  danger: 'err-ink',
  ghost: 'text',
  link: 'accent',
};

export type ButtonProps = Omit<PressableProps, 'children'> &
  Omit<VariantProps<typeof button>, 'disabled'> & {
    label: string;
    loading?: boolean;
    leftIcon?: IconName;
    rightIcon?: IconName;
  };

export function Button({
  variant = 'primary',
  size,
  label,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = Boolean(disabled) || loading;
  // Cargando conserva su color; deshabilitado se ve gris (salvo los enlaces)
  const looksDisabled = Boolean(disabled) && variant !== 'link';
  const { container, label: labelStyle } = button({ variant, size, disabled: looksDisabled });
  const color: ColorToken = looksDisabled ? 'faint' : contentColor[variant];
  return (
    <Pressable
      className={container()}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors[color]} />
      ) : (
        <>
          {leftIcon && <Icon name={leftIcon} color={color} />}
          <Text className={labelStyle()}>{label}</Text>
          {rightIcon && <Icon name={rightIcon} color={color} />}
        </>
      )}
    </Pressable>
  );
}
