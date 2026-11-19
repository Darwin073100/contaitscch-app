import { unexpectedErrorMessage } from './unexpectedError';

describe('unexpectedErrorMessage', () => {
  it('incluye el mensaje técnico del error', () => {
    expect(unexpectedErrorMessage(new Error('Sync operation timeout'))).toBe(
      'Algo falló en este dispositivo. Intenta de nuevo. Detalle: Sync operation timeout',
    );
  });

  it('acepta valores que no son Error', () => {
    expect(unexpectedErrorMessage('disk I/O error')).toContain('Detalle: disk I/O error');
  });
});
