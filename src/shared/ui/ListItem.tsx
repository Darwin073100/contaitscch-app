import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const listItem = tv({
  slots: {
    container: 'flex-row items-center gap-3',
    overline: 'font-display text-xs uppercase tracking-wide text-primary',
    title: 'font-display text-base text-white',
    subtitle: 'text-sm text-muted',
  },
  variants: {
    variant: {
      // Dentro de otra tarjeta (equipo y colaboradores)
      plain: { container: 'py-2' },
      // Tarjeta propia (objetivos, "Introducción a la app", fila del ranking)
      boxed: { container: 'rounded-3xl bg-card p-4' },
      // Fila resaltada ("Tú" en el ranking)
      highlight: { container: 'rounded-3xl border-l-4 border-primary bg-surface p-4' },
    },
    pressable: { true: { container: 'active:opacity-80' } },
  },
  defaultVariants: { variant: 'plain' },
});

type ListItemProps = Omit<VariantProps<typeof listItem>, 'pressable'> & {
  title: string;
  subtitle?: string;
  overline?: string;
  /** Normalmente un IconBox, Avatar o la posición del ranking. */
  leading?: ReactNode;
  /** Chevron, contador, Badge… */
  trailing?: ReactNode;
  /** Contenido extra bajo el título (por ejemplo Badge de nivel + temas). */
  meta?: ReactNode;
  subtitleLines?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ListItem({
  title,
  subtitle,
  overline,
  leading,
  trailing,
  meta,
  subtitleLines,
  variant,
  onPress,
  accessibilityLabel,
}: ListItemProps) {
  const s = listItem({ variant, pressable: Boolean(onPress) });
  const content = (
    <>
      {leading}
      <View className="flex-1 gap-0.5">
        {overline && <Text className={s.overline()}>{overline}</Text>}
        <Text className={s.title()} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className={s.subtitle()} numberOfLines={subtitleLines}>
            {subtitle}
          </Text>
        )}
        {meta}
      </View>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        className={s.container()}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View className={s.container()} accessibilityLabel={accessibilityLabel}>
      {content}
    </View>
  );
}
