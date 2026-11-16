import { timeAgo } from './timeAgo';

const NOW = '2026-11-15T12:00:00.000Z';

describe('timeAgo', () => {
  it.each([
    ['2026-11-15T11:59:40.000Z', 'hace un momento'],
    ['2026-11-15T10:00:00.000Z', 'hace 2 h'],
    ['2026-11-14T12:00:00.000Z', 'hace 1 día'],
    ['2026-11-12T12:00:00.000Z', 'hace 3 días'],
  ])('%s → %s', (iso, text) => {
    expect(timeAgo(iso, NOW)).toBe(text);
  });
});
