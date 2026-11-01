import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { colors, type ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

const button = tv({
  slots: {
    container: 'flex-row items-center justify-center gap-2 rounded-2xl px-6 active:opacity-80',
    label: 'font-display',
  },
  variants: {
    variant: {
      primary: { container: 'bg-primary', label: 'text-bg' },
      soft: { container: 'bg-primary-soft', label: 'text-bg' },
      secondary: { container: 'bg-surface', label: 'text-white' },
      ghost: { container: 'bg-transparent', label: 'text-accent' },
      locked: { container: 'bg-surface opacity-50', label: 'text-muted' },
    },
    size: {
      sm: { container: 'h-10 rounded-xl px-4', label: 'text-sm' },
      md: { container: 'h-12', label: 'text-base' },
      lg: { container: 'h-14', label: 'text-lg' },
    },
  },
  defaultVariants: { variant: 'primary', size: 'lg' },
});

type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

const contentColor: Record<ButtonVariant, ColorToken> = {
  primary: 'bg',
  soft: 'bg',
  secondary: 'white',
  ghost: 'accent',
  locked: 'muted',
};

type ButtonProps = Omit<PressableProps, 'children'> &
  VariantProps<typeof button> & {
    label: string;
    loading?: boolean;
    leftIcon?: IconName;
    rightIcon?: IconName;
  };

/** Botón de texto. `locked` siempre queda deshabilitado (niveles bloqueados). */
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
  const { container, label: labelStyle } = button({ variant, size });
  const color = contentColor[variant];
  const isDisabled = Boolean(disabled) || loading || variant === 'locked';
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
