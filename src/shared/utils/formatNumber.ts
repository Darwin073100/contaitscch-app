const formatter = new Intl.NumberFormat('es-MX');

/** 1250 → "1,250" (XP, posiciones, contadores). */
export function formatNumber(value: number): string {
  return formatter.format(value);
}
