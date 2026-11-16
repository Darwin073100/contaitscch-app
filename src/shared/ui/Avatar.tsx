import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

const avatar = tv({
  slots: {
    container: 'items-center justify-center rounded-full',
    label: 'font-extrabold',
  },
  variants: {
    tone: {
      // El usuario (topbar, perfil) y el 1.er lugar del podio
      amber: { container: 'bg-amber', label: 'text-amber-ink' },
      // "TÚ" en la lista del ranking
      accent: { container: 'bg-accent', label: 'text-accent-ink' },
      neutral: { container: 'bg-surface-alt', label: 'text-dim' },
      // Sobre el podio navy
      onNavy: { container: 'bg-navy-ink/15', label: 'text-navy-ink' },
    },
    size: {
      xs: { container: 'h-6 w-6', label: 'text-xs' },
      sm: { container: 'h-10 w-10', label: 'text-[13px]' },
      md: { container: 'h-11 w-11', label: 'text-sm' },
      lg: { container: 'h-16 w-16', label: 'text-[22px]' },
      xl: { container: 'h-20 w-20', label: 'text-[25px]' },
    },
    // Aro de "eres tú" en el podio
    ring: { true: { container: 'border-[3px] border-accent-soft' } },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

type AvatarTone = NonNullable<VariantProps<typeof avatar>['tone']>;

const iconColor: Record<AvatarTone, ColorToken> = {
  amber: 'amber-ink',
  accent: 'accent-ink',
  neutral: 'dim',
  onNavy: 'navy-ink',
};

type AvatarProps = VariantProps<typeof avatar> & {
  /** Texto corto: iniciales ("CM", "TÚ"). Usa getInitials(). */
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
