import { Text, type TextProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const text = tv({
  base: 'font-sans text-white',
  variants: {
    variant: {
      title: 'font-display text-3xl',
      subtitle: 'font-semibold text-xl',
      body: 'text-base',
      caption: 'text-sm text-muted',
    },
  },
  defaultVariants: { variant: 'body' },
});

type AppTextProps = TextProps & VariantProps<typeof text>;

export function AppText({ variant, className, ...props }: AppTextProps) {
  return <Text className={text({ variant, className })} {...props} />;
}
