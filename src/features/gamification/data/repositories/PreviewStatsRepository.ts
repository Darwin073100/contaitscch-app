import type { Clock } from '@/core/clock/Clock';

import { shiftDay } from '../../domain/policies/StreakCalculator';
import type { ActivityReader, XpReader } from '../../domain/repositories/StatsReaders';

// Temporal: actividad de ejemplo coherente con el temario de learning (3 temas × 5 XP, uno por día)
// y una racha de 5 días que termina hoy. Se reemplaza por los repositorios SQLite de xp_event y
// daily_activity (ver spec/03_home_levels_spec.md, sección 9).
export class PreviewStatsRepository implements XpReader, ActivityReader {
  constructor(private readonly clock: Clock) {}

  private events() {
    const today = this.clock.todayLocal();
    return [-2, -1, 0].map((offset) => ({ day: shiftDay(today, offset), points: 5 }));
  }

  async getTotal(): Promise<number> {
    return this.events().reduce((sum, e) => sum + e.points, 0);
  }

  async getEarnedOn(day: string): Promise<number> {
    return this.events()
      .filter((e) => e.day === day)
      .reduce((sum, e) => sum + e.points, 0);
  }

  async getActiveDays(): Promise<string[]> {
    const today = this.clock.todayLocal();
    return [-4, -3, -2, -1, 0].map((offset) => shiftDay(today, offset));
  }
}
