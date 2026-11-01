import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const progress = tv({
  slots: {
    track: 'w-full overflow-hidden rounded-full bg-surface',
    fill: 'h-full rounded-full',
  },
  variants: {
    tone: {
      primary: { fill: 'bg-primary' },
      accent: { fill: 'bg-accent' },
      streak: { fill: 'bg-streak' },
    },
    size: {
      sm: { track: 'h-1.5' },
      md: { track: 'h-2.5' },
      lg: { track: 'h-3.5' },
    },
  },
  defaultVariants: { tone: 'primary', size: 'md' },
});

type ProgressBarProps = VariantProps<typeof progress> & {
  /** Avance de 0 a 1 (se recorta fuera de ese rango). */
  value: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, tone, size, accessibilityLabel }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100);
  const { track, fill } = progress({ tone, size });
  return (
    <View
      className={track()}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View className={fill()} style={{ width: `${percent}%` }} />
    </View>
  );
}
