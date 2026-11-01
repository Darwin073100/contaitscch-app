import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

const avatar = tv({
  slots: {
    container: 'items-center justify-center rounded-full',
    label: 'font-display',
  },
  variants: {
    tone: {
      primary: { container: 'bg-primary', label: 'text-bg' },
      soft: { container: 'bg-primary-soft', label: 'text-bg' },
      neutral: { container: 'bg-surface', label: 'text-silver' },
      // Medallas del podio
      gold: { container: 'bg-streak', label: 'text-bg' },
      silver: { container: 'bg-silver', label: 'text-bg' },
      bronze: { container: 'bg-bronze', label: 'text-white' },
    },
    size: {
      xs: { container: 'h-6 w-6', label: 'text-xs' },
      sm: { container: 'h-9 w-9', label: 'text-sm' },
      md: { container: 'h-12 w-12', label: 'text-base' },
      lg: { container: 'h-16 w-16', label: 'text-xl' },
      xl: { container: 'h-20 w-20', label: 'text-2xl' },
    },
    ring: { true: { container: 'border-4 border-card' } },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

type AvatarTone = NonNullable<VariantProps<typeof avatar>['tone']>;

const iconColor: Record<AvatarTone, ColorToken> = {
  primary: 'bg',
  soft: 'bg',
  neutral: 'silver',
  gold: 'bg',
  silver: 'bg',
  bronze: 'white',
};

type AvatarProps = VariantProps<typeof avatar> & {
  /** Texto corto: iniciales ("CM", "TÚ") o la posición del podio ("1"). Usa getInitials(). */
  label?: string;
  icon?: IconName;
  accessibilityLabel?: string;
};

export function Avatar({
  label,
  icon,
  tone = 'neutral',
  size,
  ring,
  accessibilityLabel,
}: AvatarProps) {
  const { container, label: labelStyle } = avatar({ tone, size, ring });
  return (
    <View
      className={container()}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    >
      {icon ? (
        <Icon name={icon} color={iconColor[tone]} />
      ) : (
        <Text className={labelStyle()}>{label}</Text>
      )}
    </View>
  );
}
