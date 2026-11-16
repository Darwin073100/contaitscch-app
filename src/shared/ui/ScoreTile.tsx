import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const tile = tv({
  slots: {
    container: 'flex-1 items-center rounded-2xl border border-line bg-surface px-1.5 py-3',
    label: 'font-extrabold text-[11px] uppercase tracking-wider text-dim',
    value: 'mt-1 font-extrabold text-2xl',
  },
  variants: {
    tone: {
      default: { value: 'text-text' },
      success: { value: 'text-accent' },
      danger: { value: 'text-err' },
    },
  },
  defaultVariants: { tone: 'default' },
});

type ScoreTileProps = VariantProps<typeof tile> & { label: string; value: string };

/** Cifra del resultado: Aciertos 2/2 · Para aprobar 2/2 · Intento 1. */
export function ScoreTile({ label, value, tone }: ScoreTileProps) {
  const s = tile({ tone });
  return (
    <View className={s.container()} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text className={s.label()}>{label}</Text>
      <Text className={s.value()}>{value}</Text>
    </View>
  );
}
