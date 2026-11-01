import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('separa miles con coma', () => {
    expect(formatNumber(1250)).toBe('1,250');
    expect(formatNumber(5)).toBe('5');
  });
});
