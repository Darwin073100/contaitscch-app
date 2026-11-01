import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { colors } from '../theme';

const button = tv({
  slots: {
    container: 'h-14 flex-row items-center justify-center gap-2 rounded-2xl px-6',
    label: 'font-display text-lg',
  },
  variants: {
    variant: {
      primary: { container: 'bg-primary', label: 'text-bg' },
      ghost: { container: 'bg-card', label: 'text-white' },
      locked: { container: 'bg-card opacity-50', label: 'text-muted' },
    },
  },
  defaultVariants: { variant: 'primary' },
});

type ButtonProps = Omit<PressableProps, 'children'> &
  VariantProps<typeof button> & {
    label: string;
    loading?: boolean;
  };

export function Button({ variant, label, loading = false, disabled, ...props }: ButtonProps) {
  const { container, label: labelStyle } = button({ variant });
  return (
    <Pressable
      className={container()}
      disabled={disabled || loading}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || !variant ? colors.bg : colors.white} />
      ) : (
        <Text className={labelStyle()}>{label}</Text>
      )}
    </Pressable>
  );
}
