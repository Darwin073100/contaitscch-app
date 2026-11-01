import { Text, type TextProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

// El orden importa: tone y weight van después de variant para poder sobrescribirlo.
const text = tv({
  base: 'font-sans text-white',
  variants: {
    variant: {
      display: 'font-extrabold text-4xl',
      title: 'font-display text-3xl',
      heading: 'font-display text-xl',
      subtitle: 'font-semibold text-lg',
      body: 'text-base',
      caption: 'text-sm text-muted',
      overline: 'font-display text-xs uppercase tracking-wider',
      stat: 'font-extrabold text-2xl',
    },
    tone: {
      default: 'text-white',
      muted: 'text-muted',
      primary: 'text-primary',
      accent: 'text-accent',
      streak: 'text-streak',
      danger: 'text-danger',
      silver: 'text-silver',
      bronze: 'text-bronze',
      inverse: 'text-bg',
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
