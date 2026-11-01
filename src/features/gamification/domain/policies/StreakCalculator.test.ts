import { calculateStreak, shiftDay } from './StreakCalculator';

describe('shiftDay', () => {
  it('cruza meses y años', () => {
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('calculateStreak', () => {
  const today = '2026-11-01';

  it('cuenta días consecutivos que terminan hoy', () => {
    expect(calculateStreak(['2026-10-30', '2026-10-31', '2026-11-01'], today)).toBe(3);
  });

  it('la racha sigue viva si el último día activo fue ayer', () => {
    expect(calculateStreak(['2026-10-30', '2026-10-31'], today)).toBe(2);
  });

  it('se rompe si el último día activo fue anteayer', () => {
    expect(calculateStreak(['2026-10-29', '2026-10-30'], today)).toBe(0);
  });

  it('un hueco corta la racha', () => {
    expect(calculateStreak(['2026-10-28', '2026-10-31', '2026-11-01'], today)).toBe(2);
  });

  it('sin actividad la racha es 0', () => {
    expect(calculateStreak([], today)).toBe(0);
  });
});
