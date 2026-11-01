import { parseEmphasis } from './parseEmphasis';

describe('parseEmphasis', () => {
  it('separa los fragmentos en negrita', () => {
    expect(parseEmphasis('La suma del **DEBE** coincide con el **HABER**.')).toEqual([
      { text: 'La suma del ', bold: false },
      { text: 'DEBE', bold: true },
      { text: ' coincide con el ', bold: false },
      { text: 'HABER', bold: true },
      { text: '.', bold: false },
    ]);
  });

  it('deja intacto el texto sin marcas o con marcas incompletas', () => {
    expect(parseEmphasis('Texto simple')).toEqual([{ text: 'Texto simple', bold: false }]);
    expect(parseEmphasis('**sin cierre')).toEqual([{ text: '**sin cierre', bold: false }]);
  });
});
