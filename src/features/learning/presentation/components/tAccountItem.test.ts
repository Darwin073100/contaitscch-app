import { parseTAccountItem } from './tAccountItem';

describe('parseTAccountItem', () => {
  it.each([
    ['+ Activo', 'plus'],
    ['− Pasivo', 'minus'],
    ['- Pasivo', 'minus'],
    ['– Activo', 'minus'],
    ['Capital Social', null],
  ])('"%s" → %s', (raw, sign) => {
    expect(parseTAccountItem(raw).sign).toBe(sign);
  });

  it('conserva el texto original sin espacios extremos', () => {
    expect(parseTAccountItem('  + Gasto ').text).toBe('+ Gasto');
  });
});
