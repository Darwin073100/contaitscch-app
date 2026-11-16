import { useColorScheme } from 'react-native';

import palettes from './colors';

export type ColorToken = keyof typeof palettes.light;
export type Palette = Record<ColorToken, string>;

export const lightColors: Palette = palettes.light;
export const darkColors: Palette = palettes.dark;

/**
 * Paleta del modo actual (claro u oscuro, según el sistema) para lo que no usa className:
 * iconos, SVG, barra de pestañas, indicadores de carga. El resto usa clases como bg-surface.
 */
export function useThemeColors(): Palette {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
