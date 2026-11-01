import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tv, type VariantProps } from 'tailwind-variants';

const screen = tv({
  base: 'flex-1 bg-bg px-4',
  variants: {
    align: {
      top: '',
      center: 'items-center justify-center gap-2',
    },
  },
  defaultVariants: { align: 'top' },
});

type ScreenProps = VariantProps<typeof screen> & { children: ReactNode };

export function Screen({ align, children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className={screen({ align })} style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
}
