import { SystemClock } from './Clock';

describe('SystemClock', () => {
  afterEach(() => jest.useRealTimers());

  it('usa el día local y no el día UTC', () => {
    // 19:00 en hora local: en México ya sería "mañana" en UTC
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 31, 19, 0, 0));

    expect(new SystemClock().todayLocal()).toBe('2026-10-31');
  });

  it('devuelve el instante actual en ISO-8601', () => {
    const now = new Date(2026, 9, 31, 8, 30, 0);
    jest.useFakeTimers().setSystemTime(now);

    expect(new SystemClock().nowIso()).toBe(now.toISOString());
  });
});
