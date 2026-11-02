import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const card = tv({
  base: 'overflow-hidden rounded-3xl',
  variants: {
    tone: {
      default: 'bg-card',
      raised: 'bg-surface',
      outline: 'border border-border bg-card',
      // Fila resaltada ("Tú" en el ranking, tema activo)
      highlight: 'border-l-4 border-primary bg-surface',
    },
    padding: { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-5' },
    locked: { true: 'opacity-60' },
    // Reparte el ancho de una Row (columnas DEBE / HABER de la Cuenta T)
    grow: { true: 'flex-1' },
    pressable: { true: 'active:opacity-80' },
  },
  defaultVariants: { tone: 'default', padding: 'md' },
});

type CardProps = Omit<VariantProps<typeof card>, 'pressable'> &
  Pick<PressableProps, 'onPress' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'> & {
    children: ReactNode;
  };

/** Contenedor base. Con `onPress` se vuelve un botón accesible; sin él es una View. */
export function Card({ tone, padding, locked, grow, onPress, children, ...a11y }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        className={card({ tone, padding, locked, grow, pressable: true })}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(locked) }}
        {...a11y}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={card({ tone, padding, locked, grow })} {...a11y}>
      {children}
    </View>
  );
}
