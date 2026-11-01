import { Text, View } from 'react-native';

import type { ColorToken } from '../theme';
import { formatNumber } from '../utils';
import { Icon, type IconName } from './Icon';

type StatTileProps = {
  label: string;
  value?: number | string;
  icon?: IconName;
  iconColor?: ColorToken;
};

/**
 * Celda de estadística que ocupa el ancho disponible. Se usa en filas de 3:
 * Home (5 Racha · 1,250 XP · Básico Nivel) y Acerca de (Rachas · XP · Vidas).
 */
export function StatTile({ label, value, icon, iconColor = 'primary' }: StatTileProps) {
  const text = typeof value === 'number' ? formatNumber(value) : value;
  return (
    <View
      className="flex-1 items-center justify-center gap-1 rounded-2xl bg-surface px-2 py-3"
      accessible
      accessibilityLabel={text ? `${label}: ${text}` : label}
    >
      {icon && <Icon name={icon} color={iconColor} size="lg" />}
      {text !== undefined && (
        <Text className="font-extrabold text-2xl text-white" numberOfLines={1}>
          {text}
        </Text>
      )}
      <Text className="text-center font-semibold text-xs text-muted" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
