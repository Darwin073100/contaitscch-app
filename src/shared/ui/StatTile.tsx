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
 * Celda de estadística que ocupa el ancho disponible. Se usa en filas:
 * Home (3/24 Temas · Nivel 1) y Acerca de (6 niveles · 24 temas · Ejercicio por tema).
 */
export function StatTile({ label, value, icon, iconColor = 'accent' }: StatTileProps) {
  const text = typeof value === 'number' ? formatNumber(value) : value;
  return (
    <View
      className="min-w-0 flex-1 gap-1.5 rounded-[14px] border border-line bg-surface p-3"
      accessible
      accessibilityLabel={text ? `${label}: ${text}` : label}
    >
      {icon && <Icon name={icon} color={iconColor} size="lg" />}
      {text !== undefined && (
        <Text className="font-extrabold text-[17px] text-text" numberOfLines={1}>
          {text}
        </Text>
      )}
      <Text className="font-semibold text-xs text-dim" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
