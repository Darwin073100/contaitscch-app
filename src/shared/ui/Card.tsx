import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const card = tv({
  base: 'overflow-hidden rounded-[20px]',
  variants: {
    tone: {
      default: 'border border-line bg-surface',
      // Sin borde (tips, avisos dentro de otra sección)
      flat: 'bg-surface',
      // Bloqueado o secundario
      alt: 'bg-surface-alt',
      // Marca: siguiente tema, nivel, podio, perfil
      navy: 'bg-navy',
      // Fila propia ("Tú" en el ranking), tema activo
      highlight: 'border border-accent bg-accent/10',
      // Idea clave, error común y actividad del repaso
      key: 'bg-amber/15',
      warn: 'bg-err/10',
      task: 'border-2 border-dashed border-line',
    },
    padding: { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-5' },
    locked: { true: 'opacity-60' },
    // Reparte el ancho de una Row (columnas DEBE / HABER de la Cuenta T)
    grow: { true: 'flex-1' },
    pressable: { true: 'active:opacity-80' },
  },
  defaultVariants: { tone: 'default', padding: 'lg' },
});

export type CardTone = NonNullable<VariantProps<typeof card>['tone']>;

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
