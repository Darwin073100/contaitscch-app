import { toSyncStatusVm } from './syncStatusVm';

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
