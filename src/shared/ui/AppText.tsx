import { Text, type TextProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

// El orden importa: tone y weight van después de variant para poder sobrescribirlo.
const text = tv({
  base: 'font-sans text-text',
  variants: {
    variant: {
      display: 'font-extrabold text-3xl text-title',
      title: 'font-extrabold text-2xl text-title',
      heading: 'font-extrabold text-xl text-title',
      subtitle: 'font-display text-lg',
      body: 'text-base',
      caption: 'text-sm text-dim',
      overline: 'font-extrabold text-xs uppercase tracking-wider text-dim',
      stat: 'font-extrabold text-2xl',
    },
    tone: {
      default: 'text-text',
      title: 'text-title',
      muted: 'text-dim',
      faint: 'text-faint',
      accent: 'text-accent',
      // amber-text: el ámbar legible sobre fondos claros
      amber: 'text-amber-text',
      success: 'text-ok',
      danger: 'text-err',
      bronze: 'text-bronze',
      // Sobre tarjetas y barras navy
      onNavy: 'text-navy-ink',
      onNavyMuted: 'text-navy-dim',
      onNavyAmber: 'text-amber',
    },
    weight: {
      regular: 'font-sans',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-display',
      extrabold: 'font-extrabold',
    },
    align: { left: 'text-left', center: 'text-center', right: 'text-right' },
  },
  defaultVariants: { variant: 'body' },
});

export type AppTextProps = TextProps & VariantProps<typeof text>;
export type TextTone = NonNullable<AppTextProps['tone']>;

export function AppText({ variant, tone, weight, align, className, ...props }: AppTextProps) {
  return <Text className={text({ variant, tone, weight, align, className })} {...props} />;
}
