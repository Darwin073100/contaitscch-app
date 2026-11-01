import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const divider = tv({
  base: 'bg-border',
  variants: {
    orientation: { horizontal: 'h-px w-full', vertical: 'w-px self-stretch' },
  },
  defaultVariants: { orientation: 'horizontal' },
});

type DividerProps = VariantProps<typeof divider>;

export function Divider({ orientation }: DividerProps) {
  return <View className={divider({ orientation })} />;
}
