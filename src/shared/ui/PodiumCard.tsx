import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { Avatar } from './Avatar';
import { Icon } from './Icon';

const pod = tv({
  slots: {
    column: 'min-w-0 flex-1 items-center gap-1',
    badge:
      'absolute -bottom-2 h-[26px] w-[26px] items-center justify-center self-center rounded-full border-[3px] border-navy',
    badgeText: 'font-extrabold text-[13px] text-navy',
    name: 'mt-2.5 max-w-full font-extrabold text-sm text-navy-ink',
    caption: 'font-display text-xs text-navy-dim',
    step: 'mt-2 w-full items-center justify-center gap-0.5 rounded-t-[14px]',
    stepValue: 'font-extrabold text-2xl',
    stepUnit: 'font-extrabold text-xs text-navy-dim',
  },
  variants: {
    first: {
      true: {
        badge: 'bg-navy-ink',
        step: 'bg-amber/20',
        stepValue: 'text-amber',
      },
      false: {
        badge: 'bg-accent-soft',
        step: 'bg-navy-ink/10',
        stepValue: 'text-navy-ink',
      },
    },
  },
});

/** Altura de la base de cada lugar (dato del diseño, no estilo). */
const STEP_HEIGHT = { 1: 92, 2: 70, 3: 56 } as const;

export type PodiumPlace = {
  place: 1 | 2 | 3;
  /** Posición mostrada (con empates puede repetirse). */
  position: number;
  initials: string;
  name: string;
  /** "17 temas". */
  caption: string;
  /** Número grande de la base: niveles completados. */
  value: number;
  /** "nivel" / "niveles". */
  unit: string;
  /** El usuario de la sesión: aro de color. */
  isMe: boolean;
};

type PodiumCardProps = {
  title: string;
  /** Regla del ranking bajo el título. */
  rule: string;
  /** Hasta 3 lugares, en orden 1, 2, 3. */
  places: PodiumPlace[];
};

function Place({ p }: { p: PodiumPlace }) {
  const s = pod({ first: p.place === 1 });
  return (
    <View
      className={s.column()}
      accessible
      accessibilityLabel={`${p.position}.º lugar: ${p.name}, ${p.value} ${p.unit}, ${p.caption}`}
    >
      {p.place === 1 && <Icon name="trophy" color="amber" size="xl" />}
      <View>
        <Avatar
          label={p.initials}
          tone={p.place === 1 ? 'amber' : 'onNavy'}
          size={p.place === 1 ? 'xl' : 'lg'}
          ring={p.isMe}
        />
        <View className={s.badge()}>
          <Text className={s.badgeText()}>{p.position}</Text>
        </View>
      </View>
      <Text className={s.name()} numberOfLines={1}>
        {p.name}
      </Text>
      <Text className={s.caption()}>{p.caption}</Text>
      <View className={s.step()} style={{ height: STEP_HEIGHT[p.place] }}>
        <Text className={s.stepValue()}>{p.value}</Text>
        <Text className={s.stepUnit()}>{p.unit}</Text>
      </View>
    </View>
  );
}

/** Podio de los 3 primeros sobre tarjeta navy: 2.º a la izquierda, 1.º al centro, 3.º a la derecha. */
export function PodiumCard({ title, rule, places }: PodiumCardProps) {
  const byPlace = (n: 1 | 2 | 3) => places.find((p) => p.place === n);
  return (
    <View className="overflow-hidden rounded-[20px] bg-navy px-4 pt-5">
      <View className="flex-row items-center gap-2">
        <Icon name="podium" color="amber" />
        <Text className="font-extrabold text-[19px] text-navy-ink" accessibilityRole="header">
          {title}
        </Text>
      </View>
      <Text className="mt-1 text-[13px] text-navy-dim">{rule}</Text>
      <View className="mt-4 flex-row items-end gap-2">
        {([2, 1, 3] as const).map((n) => {
          const p = byPlace(n);
          return p ? <Place key={n} p={p} /> : <View key={n} className="flex-1" />;
        })}
      </View>
    </View>
  );
}
