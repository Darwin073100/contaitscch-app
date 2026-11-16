import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

// Chips: estado (APROBADO, EN CURSO, BLOQUEADO), "4 temas", globos de la ruta ("Empieza aquí").
const badge = tv({
  slots: {
    // max-w-full + shrink: si no cabe, el texto se recorta con "…"
    container: 'max-w-full flex-row items-center gap-1 self-start rounded-full',
    label: 'shrink font-extrabold',
  },
  variants: {
    tone: {
      neutral: {},
      accent: {},
      navy: {},
      amber: {},
      danger: {},
      success: {},
      // Sobre tarjetas navy
      onNavy: {},
    },
    appearance: { soft: {}, solid: {} },
    size: {
      sm: { container: 'h-6 px-2.5', label: 'text-[11.5px]' },
      md: { container: 'h-8 px-3', label: 'text-[13px]' },
    },
    uppercase: { true: { label: 'uppercase tracking-wide' } },
  },
  compoundVariants: [
    {
      tone: 'neutral',
      appearance: 'soft',
      class: { container: 'bg-surface-alt', label: 'text-dim' },
    },
    {
      tone: 'accent',
      appearance: 'soft',
      class: { container: 'bg-accent/10', label: 'text-accent' },
    },
    { tone: 'navy', appearance: 'soft', class: { container: 'bg-navy/10', label: 'text-title' } },
    {
      tone: 'amber',
      appearance: 'soft',
      class: { container: 'bg-amber/15', label: 'text-amber-text' },
    },
    { tone: 'danger', appearance: 'soft', class: { container: 'bg-err/10', label: 'text-err' } },
    { tone: 'success', appearance: 'soft', class: { container: 'bg-ok/10', label: 'text-ok' } },
    {
      tone: 'onNavy',
      appearance: 'soft',
      class: { container: 'bg-navy-ink/15', label: 'text-navy-ink' },
    },
    { tone: 'neutral', appearance: 'solid', class: { container: 'bg-line', label: 'text-text' } },
    {
      tone: 'accent',
      appearance: 'solid',
      class: { container: 'bg-accent', label: 'text-accent-ink' },
    },
    { tone: 'navy', appearance: 'solid', class: { container: 'bg-navy', label: 'text-navy-ink' } },
    {
      tone: 'amber',
      appearance: 'solid',
      class: { container: 'bg-amber', label: 'text-amber-ink' },
    },
    { tone: 'danger', appearance: 'solid', class: { container: 'bg-err', label: 'text-err-ink' } },
    { tone: 'success', appearance: 'solid', class: { container: 'bg-ok', label: 'text-ok-ink' } },
    {
      tone: 'onNavy',
      appearance: 'solid',
      class: { container: 'bg-amber', label: 'text-amber-ink' },
    },
  ],
  defaultVariants: { tone: 'neutral', appearance: 'soft', size: 'sm' },
});

type BadgeVariants = VariantProps<typeof badge>;
export type BadgeTone = NonNullable<BadgeVariants['tone']>;

const iconColor: Record<BadgeTone, { soft: ColorToken; solid: ColorToken }> = {
  neutral: { soft: 'dim', solid: 'text' },
  accent: { soft: 'accent', solid: 'accent-ink' },
  navy: { soft: 'title', solid: 'navy-ink' },
  amber: { soft: 'amber-text', solid: 'amber-ink' },
  danger: { soft: 'err', solid: 'err-ink' },
  success: { soft: 'ok', solid: 'ok-ink' },
  onNavy: { soft: 'navy-ink', solid: 'amber-ink' },
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
  return (
    <View className={container()}>
      {icon && <Icon name={icon} color={iconColor[tone][appearance]} size="xs" />}
      <Text className={labelStyle()} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
