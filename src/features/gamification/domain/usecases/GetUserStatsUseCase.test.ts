import type { Clock } from '@/core/clock/Clock';

import type { ActivityReader, XpReader } from '../repositories/StatsReaders';
import { GetUserStatsUseCase } from './GetUserStatsUseCase';

const clock: Clock = { nowIso: () => '2026-11-01T18:00:00.000Z', todayLocal: () => '2026-11-01' };

class InMemoryStats implements XpReader, ActivityReader {
  constructor(
    private readonly events: { day: string; points: number }[],
    private readonly days: string[],
  ) {}

  async getTotal() {
    return this.events.reduce((sum, e) => sum + e.points, 0);
  }

  async getEarnedOn(day: string) {
    return this.events.filter((e) => e.day === day).reduce((sum, e) => sum + e.points, 0);
  }

  async getActiveDays() {
    return this.days;
  }
}

describe('GetUserStatsUseCase', () => {
  it('calcula XP total, XP de hoy y racha con el día del Clock', async () => {
    const stats = new InMemoryStats(
      [
        { day: '2026-10-31', points: 100 },
        { day: '2026-11-01', points: 5 },
        { day: '2026-11-01', points: 5 },
      ],
      ['2026-10-31', '2026-11-01'],
    );

    const result = await new GetUserStatsUseCase(stats, stats, clock).execute();

    expect(result).toEqual({ xpTotal: 110, xpToday: 10, streak: 2 });
  });
});
