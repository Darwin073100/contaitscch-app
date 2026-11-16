import { timeAgo, toSyncStatusVm } from './syncStatusVm';

const NOW = '2026-11-15T12:00:00.000Z';

describe('toSyncStatusVm', () => {
  it('sincronizado: con la hora de la última vez', () => {
    expect(
      toSyncStatusVm(
        { status: 'synced', pendingCount: 0, lastSyncedAt: '2026-11-15T11:55:00.000Z' },
        NOW,
      ),
    ).toMatchObject({
      icon: 'cloud-check-outline',
      title: 'Avance sincronizado',
      detail: 'Última vez hace 5 min',
    });
  });

  it('pendiente: cuenta los cambios sin subir', () => {
    expect(
      toSyncStatusVm({ status: 'pending', pendingCount: 1, lastSyncedAt: null }, NOW),
    ).toMatchObject({ title: '1 cambio por sincronizar', color: 'amber' });
  });

  it('sin conexión: no se puede sincronizar ahora', () => {
    expect(
      toSyncStatusVm({ status: 'offline', pendingCount: 3, lastSyncedAt: null }, NOW),
    ).toMatchObject({
      title: 'Sin conexión',
      detail: '3 cambios se guardan en el teléfono hasta tener red',
      canSyncNow: false,
    });
  });

  it('error y nunca sincronizado', () => {
    expect(
      toSyncStatusVm({ status: 'error', pendingCount: 0, lastSyncedAt: null }, NOW).title,
    ).toBe('No se pudo sincronizar');
    expect(
      toSyncStatusVm({ status: 'never', pendingCount: 0, lastSyncedAt: null }, NOW).title,
    ).toBe('Aún no se ha sincronizado');
  });
});

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
