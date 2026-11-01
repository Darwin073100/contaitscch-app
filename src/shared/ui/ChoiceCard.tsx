import { Pressable, Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon } from './Icon';

// Opción de una pregunta de opción múltiple. Sin captura en docs/design: sigue los mismos tokens.
const choice = tv({
  slots: {
    container: 'min-h-14 flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3',
    marker: 'h-8 w-8 items-center justify-center rounded-full',
    markerText: 'font-display text-sm',
    label: 'flex-1 font-medium text-base text-white',
  },
  variants: {
    state: {
      idle: {
        container: 'border-transparent bg-card active:opacity-80',
        marker: 'bg-surface',
        markerText: 'text-muted',
      },
      selected: {
        container: 'border-accent bg-accent/10',
        marker: 'bg-accent',
        markerText: 'text-bg',
      },
      correct: {
        container: 'border-primary bg-primary/10',
        marker: 'bg-primary',
        markerText: 'text-bg',
      },
      incorrect: {
        container: 'border-danger bg-danger/10',
        marker: 'bg-danger',
        markerText: 'text-bg',
      },
    },
  },
  defaultVariants: { state: 'idle' },
});

export type ChoiceState = NonNullable<VariantProps<typeof choice>['state']>;

type ChoiceCardProps = {
  label: string;
  /** Letra o número que se muestra en el marcador: "A", "B"… */
  marker: string;
  state?: ChoiceState;
  onPress?: () => void;
  disabled?: boolean;
};

export function ChoiceCard({ label, marker, state = 'idle', onPress, disabled }: ChoiceCardProps) {
  const s = choice({ state });
  return (
    <Pressable
      className={s.container()}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: state !== 'idle', disabled }}
      accessibilityLabel={label}
    >
      <View className={s.marker()}>
        {state === 'correct' || state === 'incorrect' ? (
          <Icon name={state === 'correct' ? 'check' : 'close'} color="bg" size="sm" />
        ) : (
          <Text className={s.markerText()}>{marker}</Text>
        )}
      </View>
      <Text className={s.label()}>{label}</Text>
    </Pressable>
  );
}
