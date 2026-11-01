// Estadísticas calculadas (nunca guardadas): XP = SUM(xp_event.points), racha desde daily_activity.
export type UserStats = {
  xpTotal: number;
  /** XP ganado en el día local de hoy ("+150 XP hoy"). */
  xpToday: number;
  /** Días consecutivos de actividad. */
  streak: number;
};
