import { darkColors, lightColors } from './index';

describe('tokens de color', () => {
  it('los modos claro y oscuro definen los mismos tokens', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('todos son hex de 6 dígitos (tailwind.config.js los convierte a canales RGB)', () => {
    for (const hex of [...Object.values(lightColors), ...Object.values(darkColors)]) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('la marca conserva los colores del cliente', () => {
    expect(lightColors).toMatchObject({ navy: '#0F2A44', accent: '#0E7C7B', amber: '#F2A900' });
  });
});
