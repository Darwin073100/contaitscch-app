import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import { colors, type ColorToken } from '../theme';

// Un solo set de iconos en toda la app para mantener el trazo consistente.
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const sizes = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32, '2xl': 40 } as const;
export type IconSize = keyof typeof sizes;

type IconProps = {
  name: IconName;
  color?: ColorToken;
  size?: IconSize;
};

/** Icono decorativo: los lectores de pantalla lo ignoran (la etiqueta va en el contenedor). */
export function Icon({ name, color = 'white', size = 'md' }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name}
      color={colors[color]}
      size={sizes[size]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
