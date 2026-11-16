import { View } from 'react-native';
import { tv } from 'tailwind-variants';

import { AppText } from './AppText';
import { RichText } from './RichText';

const item = tv({
  slots: {
    row: 'flex-row gap-3',
    rail: 'items-center',
    number: 'h-8 w-8 items-center justify-center rounded-full',
    line: 'mt-1 w-0.5 flex-1 bg-line',
    body: 'flex-1 pb-4',
  },
  variants: {
    // El último paso se resalta: es la conclusión del caso práctico
    last: {
      true: { number: 'bg-accent' },
      false: { number: 'bg-accent/10' },
    },
  },
});

type NumberedListProps = {
  /** Admiten negritas `**así**`. */
  items: string[];
};

/** Pasos numerados unidos por una línea (caso práctico de la lección). */
export function NumberedList({ items }: NumberedListProps) {
  return (
    <View accessibilityRole="list">
      {items.map((text, i) => {
        const last = i === items.length - 1;
        const s = item({ last });
        return (
          // La lista es estática: el índice es una llave estable
          <View key={i} className={s.row()}>
            <View className={s.rail()}>
              <View className={s.number()}>
                <AppText weight="extrabold" variant="caption" tone={last ? 'onAccent' : 'accent'}>
                  {String(i + 1)}
                </AppText>
              </View>
              {!last && <View className={s.line()} />}
            </View>
            <View className={s.body()}>
              <RichText text={text} variant="body" />
            </View>
          </View>
        );
      })}
    </View>
  );
}
