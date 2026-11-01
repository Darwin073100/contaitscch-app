// Interfaces de solo lectura (segregadas de las de escritura: AwardXp, RecordDailyActivity).

export interface XpReader {
  getTotal(): Promise<number>;
  /** XP ganado en un día local 'YYYY-MM-DD'. */
  getEarnedOn(day: string): Promise<number>;
}

export interface ActivityReader {
  /** Días locales 'YYYY-MM-DD' con actividad (daily_activity). */
  getActiveDays(): Promise<string[]>;
}
