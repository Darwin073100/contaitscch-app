import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

const step = tv({
  slots: {
    container: 'min-h-[46px] flex-1 flex-row items-center justify-center gap-2 rounded-[10px]',
    dot: 'h-[26px] w-[26px] items-center justify-center rounded-full',
    number: 'font-extrabold text-[13px]',
    label: 'font-display text-sm',
  },
  variants: {
    state: {
      done: { dot: 'bg-accent', number: 'text-accent-ink', label: 'text-dim' },
      active: {
        container: 'bg-navy',
        dot: 'bg-amber',
        number: 'text-amber-ink',
        label: 'text-navy-ink',
      },
      upcoming: { dot: 'bg-surface', number: 'text-dim', label: 'text-dim' },
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
      className="flex-row gap-1.5 rounded-[14px] bg-surface-alt p-1.5"
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
