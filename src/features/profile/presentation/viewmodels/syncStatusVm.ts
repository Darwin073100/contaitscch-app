import type { SyncStatus } from '@/features/quizzes';
import type { ColorToken } from '@/shared/theme';
import type { IconName } from '@/shared/ui';
import { timeAgo } from '@/shared/utils';

export type SyncStatusVm = {
  icon: IconName;
  /** Color del icono sobre la barra navy. */
  color: ColorToken;
  /** "Avance sincronizado", "3 cambios por sincronizar"… */
  title: string;
  /** "Hace 5 min", "Tu avance se guarda en el teléfono"… */
  detail: string;
  canSyncNow: boolean;
};

export function toSyncStatusVm(sync: SyncStatus, nowIso: string): SyncStatusVm {
  const last = sync.lastSyncedAt ? `Última vez ${timeAgo(sync.lastSyncedAt, nowIso)}` : '';
  const pending = `${sync.pendingCount} ${sync.pendingCount === 1 ? 'cambio' : 'cambios'}`;
  switch (sync.status) {
    case 'synced':
      return {
        icon: 'cloud-check-outline',
        color: 'accent-soft',
        title: 'Avance sincronizado',
        detail: last,
        canSyncNow: true,
      };
    case 'pending':
      return {
        icon: 'cloud-upload-outline',
        color: 'amber',
        title: `${pending} por sincronizar`,
        detail: last || 'Se suben solos cuando hay conexión',
        canSyncNow: true,
      };
    case 'offline':
      return {
        icon: 'cloud-off-outline',
        color: 'navy-dim',
        title: 'Sin conexión',
        detail:
          sync.pendingCount > 0
            ? `${pending} se guardan en el teléfono hasta tener red`
            : 'Tu avance se guarda en el teléfono',
        canSyncNow: false,
      };
    case 'error':
      return {
        icon: 'cloud-alert',
        color: 'err',
        title: 'No se pudo sincronizar',
        detail: sync.pendingCount > 0 ? `${pending} pendientes · Reintenta` : 'Reintenta',
        canSyncNow: true,
      };
    case 'never':
      return {
        icon: 'cloud-outline',
        color: 'navy-dim',
        title: 'Aún no se ha sincronizado',
        detail: 'Se sincroniza al tener conexión',
        canSyncNow: true,
      };
  }
}
