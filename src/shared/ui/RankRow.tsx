import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { Avatar } from './Avatar';

const row = tv({
  slots: {
    container: 'flex-row items-center gap-3 rounded-[14px] border px-3.5 py-3',
    position: 'w-7 text-center font-extrabold text-[19px]',
    title: 'font-extrabold text-base text-text',
    subtitle: 'text-[12.5px] text-dim',
    statValue: 'text-center font-extrabold text-[17px]',
    statLabel: 'text-center font-display text-[11px] text-dim',
  },
  variants: {
    me: {
      true: { container: 'border-accent bg-accent/10' },
      false: { container: 'border-line bg-surface' },
    },
    // Colores de las medallas: oro, plata (verde azulado en el prototipo) y bronce
    medal: {
      1: { position: 'text-amber-text' },
      2: { position: 'text-accent' },
      3: { position: 'text-bronze' },
      none: { position: 'text-dim' },
    },
  },
});

type RankRowProps = {
  position: number;
  initials: string;
  title: string;
  subtitle: string;
  /** Dos cifras a la derecha: niveles y temas. */
  stats: [{ value: number; label: string }, { value: number; label: string }];
  isMe: boolean;
};

/** Fila de la lista de participantes del ranking. */
export function RankRow({ position, initials, title, subtitle, stats, isMe }: RankRowProps) {
  const medal = position === 1 ? 1 : position === 2 ? 2 : position === 3 ? 3 : 'none';
  const s = row({ me: isMe, medal });
  return (
    <View
      className={s.container()}
      accessible
      accessibilityLabel={`Posición ${position}: ${title}, ${subtitle}. ${stats[0].value} ${stats[0].label}, ${stats[1].value} ${stats[1].label}`}
    >
      <Text className={s.position()}>{position}</Text>
      <Avatar label={initials} tone={isMe ? 'accent' : 'neutral'} size="md" />
      <View className="min-w-0 flex-1">
        <Text className={s.title()} numberOfLines={1}>
          {title}
        </Text>
        <Text className={s.subtitle()} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View className="flex-row gap-3">
        {stats.map((stat, i) => (
          <View key={stat.label} className="min-w-10">
            <Text className={`${s.statValue()} ${i === 0 ? 'text-accent' : 'text-title'}`}>
              {stat.value}
            </Text>
            <Text className={s.statLabel()}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
