import { Pressable, Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon } from './Icon';

// Opción de una pregunta de opción múltiple (letras A–D). Al comprobar, solo la elegida se marca
// correcta o incorrecta y las demás se atenúan: nunca se revela cuál era la correcta.
const choice = tv({
  slots: {
    container:
      'min-h-[68px] flex-row items-center gap-3.5 rounded-2xl border-2 border-b-4 px-4 py-3.5',
    marker: 'h-10 w-10 items-center justify-center rounded-xl',
    markerText: 'font-extrabold text-base',
    label: 'flex-1 font-semibold text-base text-text',
  },
  variants: {
    state: {
      idle: {
        container: 'border-line bg-surface active:border-accent-soft',
        marker: 'bg-surface-alt',
        markerText: 'text-dim',
      },
      selected: {
        container: 'border-accent bg-accent/10',
        marker: 'bg-accent',
        markerText: 'text-accent-ink',
      },
      correct: {
        container: 'border-ok bg-ok/10',
        marker: 'bg-ok',
        markerText: 'text-ok-ink',
      },
      incorrect: {
        container: 'border-err bg-err/10',
        marker: 'bg-err',
        markerText: 'text-err-ink',
      },
      faded: {
        container: 'border-line bg-surface opacity-50',
        marker: 'bg-surface-alt',
        markerText: 'text-dim',
      },
    },
  },
  defaultVariants: { state: 'idle' },
});

export type ChoiceState = NonNullable<VariantProps<typeof choice>['state']>;

type ChoiceCardProps = {
  label: string;
  /** Letra que se muestra en el marcador: "A", "B"… */
  marker: string;
  state?: ChoiceState;
  onPress?: () => void;
  disabled?: boolean;
};

export function ChoiceCard({ label, marker, state = 'idle', onPress, disabled }: ChoiceCardProps) {
  const s = choice({ state });
  const checked = state === 'correct' || state === 'incorrect';
  return (
    <Pressable
      className={s.container()}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || checked, disabled }}
      accessibilityLabel={`${marker}. ${label}`}
    >
      <View className={s.marker()}>
        <Text className={s.markerText()}>{marker}</Text>
      </View>
      <Text className={s.label()}>{label}</Text>
      {checked && (
        <Icon
          name={state === 'correct' ? 'check-circle' : 'close-circle'}
          color={state === 'correct' ? 'ok' : 'err'}
          size="lg"
        />
      )}
    </Pressable>
  );
}
