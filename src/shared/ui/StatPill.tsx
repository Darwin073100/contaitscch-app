import { Text, View } from 'react-native';

import type { ColorToken } from '../theme';
import { formatNumber } from '../utils';
import { Icon, type IconName } from './Icon';

type StatPillProps = {
  icon: IconName;
  iconColor?: ColorToken;
  /** Número (se formatea "1,250") o texto ("∞"). */
  value: number | string;
  accessibilityLabel: string;
};

/** Píldora del encabezado: racha 🔥, XP ⚡, vidas ♥. */
export function StatPill({ icon, iconColor = 'white', value, accessibilityLabel }: StatPillProps) {
  return (
    <View
      className="h-8 flex-row items-center gap-1 rounded-full bg-surface px-3"
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={icon} color={iconColor} size="sm" />
      <Text className="font-display text-sm text-white">
        {typeof value === 'number' ? formatNumber(value) : value}
      </Text>
    </View>
  );
}
