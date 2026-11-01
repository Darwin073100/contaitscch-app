import { addDays, format, parseISO } from 'date-fns';

/** Día local 'YYYY-MM-DD' desplazado n días. */
export function shiftDay(day: string, days: number): string {
  return format(addDays(parseISO(day), days), 'yyyy-MM-dd');
}

/**
 * Racha = días consecutivos con actividad que terminan hoy o ayer.
 * Si el último día activo es anteayer o antes, la racha es 0.
 */
export function calculateStreak(activeDays: readonly string[], today: string): number {
  const days = new Set(activeDays);
  const yesterday = shiftDay(today, -1);
  let cursor: string | null = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  let streak = 0;
  while (cursor && days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}
