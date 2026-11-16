import { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const progress = tv({
  slots: {
    track: 'w-full overflow-hidden rounded-full bg-surface-alt',
    fill: 'h-full rounded-full',
  },
  variants: {
    tone: {
      accent: { fill: 'bg-accent' },
      amber: { fill: 'bg-amber' },
      // Contraseña débil en el medidor de seguridad del registro
      danger: { fill: 'bg-err' },
    },
    size: {
      sm: { track: 'h-2' },
      md: { track: 'h-3' },
    },
    // Sobre una tarjeta o barra navy
    onNavy: { true: { track: 'bg-navy-ink/15' } },
  },
  defaultVariants: { tone: 'accent', size: 'md' },
});

type ProgressBarProps = VariantProps<typeof progress> & {
  /** Avance de 0 a 1 (se recorta fuera de ese rango). */
  value: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, tone, size, onNavy, accessibilityLabel }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100);
  const { track, fill } = progress({ tone, size, onNavy });
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
