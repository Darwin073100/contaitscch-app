import type { Clock } from '@/core/clock/Clock';

import type { UserStats } from '../entities/UserStats';
import { calculateStreak } from '../policies/StreakCalculator';
import type { ActivityReader, XpReader } from '../repositories/StatsReaders';

/** XP total, XP de hoy y racha del usuario (encabezado y Home). */
export class GetUserStatsUseCase {
  constructor(
    private readonly xp: XpReader,
    private readonly activity: ActivityReader,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<UserStats> {
    const today = this.clock.todayLocal();
    const [xpTotal, xpToday, activeDays] = await Promise.all([
      this.xp.getTotal(),
      this.xp.getEarnedOn(today),
      this.activity.getActiveDays(),
    ]);
    return { xpTotal, xpToday, streak: calculateStreak(activeDays, today) };
  }
}
