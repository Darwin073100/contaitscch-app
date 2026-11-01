import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

// Etiquetas pequeñas: estado (EN CURSO, BLOQUEADO), nivel (Básico), chips de temas, globo "¡Toca para continuar!".
const badge = tv({
  slots: {
    // max-w-full + shrink: si no cabe, el texto se recorta con "…" (etiquetas del temario)
    container: 'max-w-full flex-row items-center gap-1 self-start rounded-full',
    label: 'shrink font-display',
  },
  variants: {
    tone: {
      primary: {},
      accent: {},
      info: {},
      streak: {},
      danger: {},
      neutral: {},
    },
    appearance: { soft: {}, solid: {} },
    size: {
      sm: { container: 'h-6 px-2.5', label: 'text-xs' },
      md: { container: 'h-8 px-3', label: 'text-sm' },
    },
    uppercase: { true: { label: 'uppercase tracking-wide' } },
  },
  compoundVariants: [
    {
      tone: 'primary',
      appearance: 'soft',
      class: { container: 'bg-primary/15', label: 'text-primary' },
    },
    {
      tone: 'accent',
      appearance: 'soft',
      class: { container: 'bg-accent/15', label: 'text-accent' },
    },
    { tone: 'info', appearance: 'soft', class: { container: 'bg-info/30', label: 'text-accent' } },
    {
      tone: 'streak',
      appearance: 'soft',
      class: { container: 'bg-streak/15', label: 'text-streak' },
    },
    {
      tone: 'danger',
      appearance: 'soft',
      class: { container: 'bg-danger/15', label: 'text-danger' },
    },
    {
      tone: 'neutral',
      appearance: 'soft',
      class: { container: 'bg-surface', label: 'text-muted' },
    },
    { tone: 'primary', appearance: 'solid', class: { container: 'bg-primary', label: 'text-bg' } },
    { tone: 'accent', appearance: 'solid', class: { container: 'bg-accent', label: 'text-bg' } },
    { tone: 'info', appearance: 'solid', class: { container: 'bg-info', label: 'text-white' } },
    { tone: 'streak', appearance: 'solid', class: { container: 'bg-streak', label: 'text-bg' } },
    { tone: 'danger', appearance: 'solid', class: { container: 'bg-danger', label: 'text-bg' } },
    {
      tone: 'neutral',
      appearance: 'solid',
      class: { container: 'bg-border', label: 'text-white' },
    },
  ],
  defaultVariants: { tone: 'neutral', appearance: 'soft', size: 'sm' },
});

type BadgeVariants = VariantProps<typeof badge>;
type BadgeTone = NonNullable<BadgeVariants['tone']>;

const softIconColor: Record<BadgeTone, ColorToken> = {
  primary: 'primary',
  accent: 'accent',
  info: 'accent',
  streak: 'streak',
  danger: 'danger',
  neutral: 'muted',
};

type BadgeProps = BadgeVariants & { label: string; icon?: IconName };

export function Badge({
  label,
  icon,
  tone = 'neutral',
  appearance = 'soft',
  size,
  uppercase,
}: BadgeProps) {
  const { container, label: labelStyle } = badge({ tone, appearance, size, uppercase });
  const color: ColorToken =
    appearance === 'solid'
      ? tone === 'info' || tone === 'neutral'
        ? 'white'
        : 'bg'
      : softIconColor[tone];
  return (
    <View className={container()}>
      {icon && <Icon name={icon} color={color} size="xs" />}
      <Text className={labelStyle()} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
