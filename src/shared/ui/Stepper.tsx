import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

const step = tv({
  slots: {
    container: 'h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl',
    dot: 'h-6 w-6 items-center justify-center rounded-full',
    number: 'font-display text-xs',
    label: 'font-display text-sm',
  },
  variants: {
    state: {
      done: { dot: 'bg-primary', number: 'text-bg', label: 'text-white' },
      active: {
        container: 'bg-info',
        dot: 'bg-white/20',
        number: 'text-white',
        label: 'text-white',
      },
      upcoming: { dot: 'bg-surface', number: 'text-muted', label: 'text-muted' },
    },
  },
});

type StepperProps = {
  steps: string[];
  /** Índice del paso actual, empezando en 0. */
  current: number;
};

/** Pasos segmentados del registro: "1 Tus Datos | 2 Verificación". */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <View
      className="flex-row gap-1 rounded-2xl bg-card p-1"
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current] ?? ''}`}
    >
      {steps.map((label, i) => {
        const s = step({ state: i < current ? 'done' : i === current ? 'active' : 'upcoming' });
        return (
          <View key={label} className={s.container()}>
            <View className={s.dot()}>
              <Text className={s.number()}>{i < current ? '✓' : i + 1}</Text>
            </View>
            <Text className={s.label()} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
