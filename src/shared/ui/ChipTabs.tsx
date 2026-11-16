import { Pressable, ScrollView, Text } from 'react-native';
import { tv } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';

const chip = tv({
  slots: {
    container:
      'h-10 flex-row items-center gap-1.5 rounded-full border border-b-[3px] px-3.5 active:opacity-80',
    label: 'font-display text-sm',
  },
  variants: {
    selected: {
      true: { container: 'border-navy-rim bg-navy', label: 'text-navy-ink' },
      false: { container: 'border-line bg-surface', label: 'text-dim' },
    },
  },
});

export type ChipTab = {
  id: number;
  label: string;
  selected: boolean;
  icon?: IconName;
  /** Color del icono cuando no está seleccionado (en el seleccionado va claro). */
  iconColor?: ColorToken;
  accessibilityLabel?: string;
};

type ChipTabsProps = {
  tabs: ChipTab[];
  onSelect: (id: number) => void;
};

/** Fila de chips con desplazamiento horizontal (niveles de la pestaña Aprender). */
export function ChipTabs({ tabs, onSelect }: ChipTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
      className="-mx-4"
    >
      {tabs.map((tab) => {
        const s = chip({ selected: tab.selected });
        return (
          <Pressable
            key={tab.id}
            className={s.container()}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: tab.selected }}
            accessibilityLabel={tab.accessibilityLabel ?? tab.label}
          >
            {tab.icon && (
              <Icon
                name={tab.icon}
                color={tab.selected ? 'accent-soft' : (tab.iconColor ?? 'dim')}
                size="sm"
              />
            )}
            <Text className={s.label()}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
