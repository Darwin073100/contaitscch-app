import { Pressable, Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

const item = tv({
  slots: {
    row: 'min-h-[56px] flex-row items-center gap-3.5 px-[18px] py-4 active:bg-surface-alt',
    label: 'flex-1 font-display text-base',
  },
  variants: {
    danger: {
      true: { label: 'text-err' },
      false: { label: 'text-text' },
    },
    divided: { true: { row: 'border-t border-line' } },
  },
});

export type MenuItem = {
  label: string;
  icon: IconName;
  iconColor?: ColorToken;
  /** Acción destructiva (cerrar sesión): en rojo y sin chevron. */
  danger?: boolean;
  onPress: () => void;
};

/** Lista de opciones dentro de una tarjeta (menú del perfil). */
export function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <View className="overflow-hidden rounded-[20px] border border-line bg-surface">
      {items.map((it, i) => {
        const s = item({ danger: Boolean(it.danger), divided: i > 0 });
        return (
          <Pressable
            key={it.label}
            className={s.row()}
            onPress={it.onPress}
            accessibilityRole="button"
            accessibilityLabel={it.label}
          >
            <Icon name={it.icon} color={it.danger ? 'err' : (it.iconColor ?? 'accent')} />
            <Text className={s.label()}>{it.label}</Text>
            {!it.danger && <Icon name="chevron-right" color="faint" />}
          </Pressable>
        );
      })}
    </View>
  );
}
