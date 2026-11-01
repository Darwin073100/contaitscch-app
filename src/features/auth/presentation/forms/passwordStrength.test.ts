import { getPasswordStrength } from './passwordStrength';

describe('getPasswordStrength', () => {
  it.each([
    ['', 'empty'],
    ['abc', 'weak'],
    ['abcdefgh', 'weak'],
    ['abcdef12', 'medium'],
    ['Contaitscch2026', 'strong'],
    ['cuenta-t-2026', 'strong'],
  ])('"%s" → %s', (password, expected) => {
    expect(getPasswordStrength(password)).toBe(expected);
  });
});
